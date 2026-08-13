-- ============================================================
-- Rescate Sabor — SEGURIDAD (migración para base ya existente)
-- Ejecutar UNA vez en Supabase SQL Editor. Es idempotente: se puede
-- correr más de una vez sin error, sin importar qué migraciones
-- anteriores (add_admin_role.sql, fix_signup_trigger.sql,
-- migrate_reserve_functions.sql) ya se hayan aplicado o no.
--
-- Qué cierra:
-- 1) Cualquier usuario podía leer la tabla profiles completa
--    (todos los emails/roles de todos los usuarios).
-- 2) Un usuario podía auto-asignarse role='admin' con un UPDATE
--    directo a su propio perfil (no había protección en ese campo).
-- 3) El registro público aceptaba cualquier valor de role, incluido
--    'admin', desde la app (la pantalla incluso lo ofrecía como opción).
-- 4) Insertar reservas o cancelarlas directamente por API (sin pasar
--    por las funciones atómicas) dejaba el stock sin descontar/
--    restaurar -> sobreventa y descuadre de inventario.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Rol 'admin' permitido en el constraint (por si add_admin_role.sql
--    no se corrió todavía)
-- ------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('buyer', 'seller', 'admin'));

-- ------------------------------------------------------------
-- 2. Alta de usuario: solo 'buyer'/'seller' desde el registro público;
--    'admin' nunca se auto-asigna. name/role se guardan desde metadata
--    con privilegios, así funciona con confirmación de email pendiente.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text := new.raw_user_meta_data->>'role';
begin
  if v_role not in ('buyer', 'seller') then
    v_role := 'buyer';
  end if;
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', v_role)
  on conflict (id) do update set
    email = excluded.email,
    name  = coalesce(excluded.name, public.profiles.name),
    role  = coalesce(public.profiles.role, excluded.role);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Repara cuentas existentes que quedaron sin rol (bug previo a fix_signup_trigger.sql)
update public.profiles p
set role = u.raw_user_meta_data->>'role',
    name = coalesce(p.name, u.raw_user_meta_data->>'name')
from auth.users u
where u.id = p.id
  and p.role is null
  and u.raw_user_meta_data->>'role' in ('buyer', 'seller');

-- ------------------------------------------------------------
-- 3. Nadie puede cambiar su propio rol (escalada de privilegios).
--    Solo un admin, o el editor SQL / service_role (auth.uid() NULL,
--    contexto de confianza — necesario para el bootstrap del primer
--    admin en el paso 7), puede modificar el campo role.
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 4. Políticas de profiles: de "cualquiera ve todo" a acceso acotado.
-- ------------------------------------------------------------
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Sellers can view profiles of their buyers" on public.profiles;
create policy "Sellers can view profiles of their buyers"
  on public.profiles for select
  using (
    exists (
      select 1 from public.reservations r
      join public.stores s on s.id = r.store_id
      where r.buyer_id = public.profiles.id and s.seller_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Admins can view all reservations" on public.reservations;
create policy "Admins can view all reservations"
  on public.reservations for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ------------------------------------------------------------
-- 5. Funciones atómicas completas (con verificación de rol comprador
--    y de que store_id coincida con la bolsa; agrega la función de
--    cancelación para vendedor si no existía).
-- ------------------------------------------------------------
create or replace function public.reserve_bag(p_bag_id uuid, p_store_id uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_reservation_id uuid;
  v_qty int;
  v_available boolean;
  v_actual_store_id uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'buyer') then
    raise exception 'Solo compradores pueden reservar';
  end if;
  select quantity, available, store_id
    into v_qty, v_available, v_actual_store_id
    from public.bags where id = p_bag_id for update;
  if v_qty is null or v_qty < 1 then raise exception 'Sin stock disponible'; end if;
  if not v_available then raise exception 'Bolsa no disponible'; end if;
  if v_actual_store_id <> p_store_id then raise exception 'store_id no coincide con la bolsa'; end if;
  insert into public.reservations (bag_id, buyer_id, store_id)
    values (p_bag_id, auth.uid(), v_actual_store_id)
    returning id into v_reservation_id;
  update public.bags set quantity = quantity - 1, available = (quantity - 1) > 0 where id = p_bag_id;
  return v_reservation_id;
end;
$$;

create or replace function public.cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_bag_id uuid; v_buyer uuid; v_status text;
begin
  select bag_id, buyer_id, status into v_bag_id, v_buyer, v_status
    from public.reservations where id = p_reservation_id for update;
  if v_buyer <> auth.uid() then raise exception 'Sin permiso'; end if;
  if v_status <> 'pending' then raise exception 'Solo se pueden cancelar reservas pendientes'; end if;
  update public.reservations set status = 'cancelled' where id = p_reservation_id;
  update public.bags set quantity = quantity + 1, available = true where id = v_bag_id;
end;
$$;

create or replace function public.seller_cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_bag_id uuid; v_store_id uuid; v_status text;
begin
  select bag_id, store_id, status into v_bag_id, v_store_id, v_status
    from public.reservations where id = p_reservation_id for update;
  if not exists (select 1 from public.stores where id = v_store_id and seller_id = auth.uid()) then
    raise exception 'Sin permiso';
  end if;
  if v_status <> 'pending' then raise exception 'Solo se pueden cancelar reservas pendientes'; end if;
  update public.reservations set status = 'cancelled' where id = p_reservation_id;
  update public.bags set quantity = quantity + 1, available = true where id = v_bag_id;
end;
$$;

-- ------------------------------------------------------------
-- 6. Cerrar los caminos directos que evitan las funciones atómicas:
--    sin esto, un insert/update por API puede reservar o cancelar
--    sin tocar el stock (sobreventa, inventario descuadrado).
-- ------------------------------------------------------------
drop policy if exists "Buyers can create reservations" on public.reservations;
drop policy if exists "Buyers can cancel their own pending reservations" on public.reservations;

drop policy if exists "Sellers can update reservation status" on public.reservations;
create policy "Sellers can update reservation status"
  on public.reservations for update
  using (exists (select 1 from public.stores where id = store_id and seller_id = auth.uid()))
  with check (
    status in ('confirmed', 'delivered') and
    exists (select 1 from public.stores where id = store_id and seller_id = auth.uid())
  );

-- ------------------------------------------------------------
-- 7. BOOTSTRAP DEL PRIMER ADMIN — descomenta la línea y pon tu email,
--    luego ejecútala UNA vez (se hace aquí, no desde la app):
-- ------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'tu@email.com';

-- ------------------------------------------------------------
-- 8. Realtime (no falla si ya estaban agregadas)
-- ------------------------------------------------------------
do $$ begin
  begin alter publication supabase_realtime add table public.reservations; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.bags; exception when duplicate_object then null; end;
end $$;
