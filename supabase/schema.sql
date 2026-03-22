-- Rescate Sabor — Database Schema
-- Run this in Supabase SQL Editor

-- =====================
-- TABLES
-- =====================

-- Profiles (extends auth.users, auto-created by trigger)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  role text check (role in ('buyer', 'seller')),
  created_at timestamptz default now() not null
);

-- Stores (one per seller)
create table if not exists public.stores (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  address text,
  created_at timestamptz default now() not null
);

-- Bags (food bags published by stores)
create table if not exists public.bags (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  description text,
  original_price numeric(10,2) not null,
  discount_price numeric(10,2) not null,
  quantity int default 1 not null,
  pickup_start time,
  pickup_end time,
  available boolean default true not null,
  created_at timestamptz default now() not null
);

-- Reservations
create table if not exists public.reservations (
  id uuid default gen_random_uuid() primary key,
  bag_id uuid references public.bags(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  status text check (status in ('pending', 'confirmed', 'delivered', 'cancelled')) default 'pending' not null,
  created_at timestamptz default now() not null
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.bags enable row level security;
alter table public.reservations enable row level security;

-- Profiles policies
create policy "Authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Stores policies
create policy "Anyone can view stores"
  on public.stores for select
  using (true);

create policy "Sellers can create stores"
  on public.stores for insert
  with check (
    auth.uid() = seller_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'seller')
  );

create policy "Sellers can update their stores"
  on public.stores for update
  using (auth.uid() = seller_id);

-- Bags policies
create policy "Anyone can view bags"
  on public.bags for select
  using (true);

create policy "Sellers can create bags for their stores"
  on public.bags for insert
  with check (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

create policy "Sellers can update their bags"
  on public.bags for update
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

create policy "Sellers can delete their bags"
  on public.bags for delete
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

-- Reservations policies
create policy "Buyers can view their own reservations"
  on public.reservations for select
  using (buyer_id = auth.uid());

create policy "Sellers can view reservations for their stores"
  on public.reservations for select
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

create policy "Buyers can create reservations"
  on public.reservations for insert
  with check (
    buyer_id = auth.uid() and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'buyer')
  );

create policy "Sellers can update reservation status"
  on public.reservations for update
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

create policy "Buyers can cancel their own pending reservations"
  on public.reservations for update
  using (buyer_id = auth.uid() and status = 'pending')
  with check (status = 'cancelled');

-- =====================
-- TRIGGER: auto-create profile on signup
-- =====================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- FUNCTIONS (security definer — operaciones atómicas que bypass RLS)
-- =====================

-- Reservar bolsa: crea reserva + decrementa cantidad con lock para evitar race conditions
create or replace function public.reserve_bag(p_bag_id uuid, p_store_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation_id uuid;
  v_qty int;
begin
  -- Lock fila y verificar stock
  select quantity into v_qty from public.bags where id = p_bag_id for update;
  if v_qty is null or v_qty < 1 then
    raise exception 'Sin stock disponible';
  end if;
  -- Crear reserva
  insert into public.reservations (bag_id, buyer_id, store_id)
    values (p_bag_id, auth.uid(), p_store_id)
    returning id into v_reservation_id;
  -- Decrementar cantidad
  update public.bags
    set quantity  = quantity - 1,
        available = (quantity - 1) > 0
    where id = p_bag_id;
  return v_reservation_id;
end;
$$;

-- Cancelar reserva: cancela + devuelve unidad al stock
create or replace function public.cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bag_id  uuid;
  v_buyer   uuid;
  v_status  text;
begin
  select bag_id, buyer_id, status
    into v_bag_id, v_buyer, v_status
    from public.reservations
    where id = p_reservation_id;
  if v_buyer <> auth.uid() then
    raise exception 'Sin permiso';
  end if;
  if v_status <> 'pending' then
    raise exception 'Solo se pueden cancelar reservas pendientes';
  end if;
  update public.reservations set status = 'cancelled' where id = p_reservation_id;
  update public.bags
    set quantity  = quantity + 1,
        available = true
    where id = v_bag_id;
end;
$$;

-- =====================
-- REALTIME
-- =====================

alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.bags;
