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
  role text check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz default now() not null
);

-- Stores (one per seller)
create table if not exists public.stores (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null unique,
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
  original_price numeric(10,2) not null check (original_price > 0),
  discount_price numeric(10,2) not null check (discount_price > 0),
  quantity int default 1 not null check (quantity >= 0),
  pickup_start time,
  pickup_end time,
  available boolean default true not null,
  created_at timestamptz default now() not null,
  check (discount_price < original_price)
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
-- INDEXES (performance)
-- =====================

create index if not exists idx_stores_seller_id on public.stores(seller_id);
create index if not exists idx_bags_store_id on public.bags(store_id);
create index if not exists idx_reservations_buyer_id on public.reservations(buyer_id);
create index if not exists idx_reservations_store_id on public.reservations(store_id);
create index if not exists idx_reservations_bag_id on public.reservations(bag_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.bags enable row level security;
alter table public.reservations enable row level security;

-- Profiles policies
-- SEGURIDAD: antes cualquier usuario autenticado podía leer la tabla completa
-- (todos los emails y roles de todos los usuarios). Se reemplaza por acceso
-- acotado a lo que cada rol realmente necesita ver.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- El vendedor necesita ver nombre/email de compradores que reservaron en su tienda
-- (para saber a quién entregar la bolsa).
create policy "Sellers can view profiles of their buyers"
  on public.profiles for select
  using (
    exists (
      select 1 from public.reservations r
      join public.stores s on s.id = r.store_id
      where r.buyer_id = public.profiles.id and s.seller_id = auth.uid()
    )
  );

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Un usuario puede editar su propio perfil (nombre/email). El campo role queda
-- protegido aparte por el trigger enforce_role_immutable — esta política por sí
-- sola NO evita que alguien intente poner role='admin' en el mismo UPDATE.
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

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

create policy "Admins can view all reservations"
  on public.reservations for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Sellers can view reservations for their stores"
  on public.reservations for select
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

-- No hay política de INSERT directo para reservas: TODAS deben pasar por la función
-- reserve_bag() (security definer, con lock). Un insert directo vía API dejaría el
-- stock sin descontar, permitiendo sobreventa — por eso se cierra ese camino.

-- El vendedor puede avanzar el estado de reservas de SUS tiendas (pending→confirmed→
-- delivered), pero NO a 'cancelled' por esta vía: cancelar debe pasar por
-- seller_cancel_reservation() para que el stock se restaure de forma atómica.
create policy "Sellers can update reservation status"
  on public.reservations for update
  using (
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  )
  with check (
    status in ('confirmed', 'delivered') and
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

-- Igual para el comprador: cancelar una reserva propia debe pasar por
-- cancel_reservation() para que el stock se restaure. No se expone UPDATE directo.

-- =====================
-- TRIGGER: auto-create profile on signup
-- =====================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text := new.raw_user_meta_data->>'role';
begin
  -- name/role vienen del metadata pasado en signUp({ options: { data: { name, role } } }).
  -- Se insertan aquí (security definer) porque el cliente aún no tiene sesión cuando
  -- el email de confirmación está pendiente, y por lo tanto no puede pasar la RLS.
  -- SEGURIDAD: el registro público solo puede crear 'buyer' o 'seller'. Cualquier otro
  -- valor (incluido 'admin') se descarta y cae a 'buyer'. 'admin' solo se otorga desde
  -- la base o por otro admin autenticado (ver enforce_role_immutable más abajo).
  if v_role not in ('buyer', 'seller') then
    v_role := 'buyer';
  end if;
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', v_role)
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    role = coalesce(public.profiles.role, excluded.role);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEGURIDAD: impide que un usuario cambie su propio rol (escalada de privilegios).
-- La política "Users can update their own profile" permite editar nombre/email, pero
-- si alguien intenta modificar 'role' sin ser admin, este trigger revierte el cambio
-- silenciosamente. auth.uid() es NULL en el editor SQL / contexto service_role
-- (confiable), así que ahí sí se permite — necesario para el bootstrap del primer admin.
create or replace function public.enforce_role_immutable()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and not exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ) then
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_role_immutable on public.profiles;
create trigger trg_enforce_role_immutable
  before update on public.profiles
  for each row execute procedure public.enforce_role_immutable();

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
  v_available boolean;
  v_actual_store_id uuid;
begin
  -- Verificar que el caller es buyer
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'buyer') then
    raise exception 'Solo compradores pueden reservar';
  end if;
  -- Lock fila y verificar stock + disponibilidad
  select quantity, available, store_id
    into v_qty, v_available, v_actual_store_id
    from public.bags where id = p_bag_id for update;
  if v_qty is null or v_qty < 1 then
    raise exception 'Sin stock disponible';
  end if;
  if not v_available then
    raise exception 'Bolsa no disponible';
  end if;
  -- Validar que p_store_id coincide con la bolsa real
  if v_actual_store_id <> p_store_id then
    raise exception 'store_id no coincide con la bolsa';
  end if;
  -- Crear reserva
  insert into public.reservations (bag_id, buyer_id, store_id)
    values (p_bag_id, auth.uid(), v_actual_store_id)
    returning id into v_reservation_id;
  -- Decrementar cantidad
  update public.bags
    set quantity  = quantity - 1,
        available = (quantity - 1) > 0
    where id = p_bag_id;
  return v_reservation_id;
end;
$$;

-- Cancelar reserva (buyer): cancela + devuelve unidad al stock
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
  -- Lock para evitar doble cancelación
  select bag_id, buyer_id, status
    into v_bag_id, v_buyer, v_status
    from public.reservations
    where id = p_reservation_id
    for update;
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

-- Cancelar reserva (seller): cancela (solo pending) + devuelve stock
create or replace function public.seller_cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bag_id   uuid;
  v_store_id uuid;
  v_status   text;
begin
  -- Lock para evitar doble cancelación
  select bag_id, store_id, status
    into v_bag_id, v_store_id, v_status
    from public.reservations
    where id = p_reservation_id
    for update;
  -- Verificar que el seller es dueño de la tienda
  if not exists (select 1 from public.stores where id = v_store_id and seller_id = auth.uid()) then
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
