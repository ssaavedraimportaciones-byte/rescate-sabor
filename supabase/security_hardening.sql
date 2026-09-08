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
-- 3.b Funciones de apoyo para las políticas
--
-- Consultar profiles DENTRO de una política sobre profiles provoca
-- "infinite recursion detected in policy for relation profiles": Postgres
-- vuelve a evaluar las políticas de la misma tabla en bucle y la deja
-- ilegible para todos, con lo que nadie puede iniciar sesión.
-- Al ser SECURITY DEFINER, estas funciones se ejecutan como su dueño y no
-- vuelven a disparar RLS, así que cortan la recursión.
-- ------------------------------------------------------------
create or replace function public.mi_rol()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false) $$;

create or replace function public.es_comprador_de_mi_tienda(p_buyer uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.reservations r
    join public.stores s on s.id = r.store_id
    where r.buyer_id = p_buyer and s.seller_id = auth.uid()
  )
$$;

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
  using (public.es_comprador_de_mi_tienda(id));

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.es_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.es_admin());

drop policy if exists "Admins can view all reservations" on public.reservations;
create policy "Admins can view all reservations"
  on public.reservations for select
  using (public.es_admin());

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
  -- Devuelve el stock. Solo reactiva si estaba apagada por quedarse sin unidades;
  -- si el vendedor la desactivó a mano (con stock > 0), respeta esa decisión.
  update public.bags
    set quantity  = quantity + 1,
        available = (available or quantity = 0)
    where id = v_bag_id;
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
  -- Devuelve el stock. Solo reactiva si estaba apagada por quedarse sin unidades;
  -- si el vendedor la desactivó a mano (con stock > 0), respeta esa decisión.
  update public.bags
    set quantity  = quantity + 1,
        available = (available or quantity = 0)
    where id = v_bag_id;
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
  -- duplicate_object: ya estaban agregadas. undefined_object: la publicación no
  -- existe (base que no es de Supabase). Ninguno de los dos debe abortar el script.
  begin alter publication supabase_realtime add table public.reservations;
    exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.bags;
    exception when duplicate_object then null; when undefined_object then null; end;
end $$;

-- Impide borrar una bolsa que tenga reservas activas de otras personas.
-- La FK reservations.bag_id es ON DELETE CASCADE, así que sin esto el borrado
-- se lleva por delante la reserva del comprador sin avisarle a nadie.
-- Solo bloquea las activas: las entregadas o canceladas no impiden limpiar.
create or replace function public.bloquear_borrado_con_reservas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_activas int;
begin
  select count(*) into v_activas
    from public.reservations
    where bag_id = old.id and status in ('pending', 'confirmed');
  if v_activas > 0 then
    raise exception 'No puedes eliminar esta bolsa: tiene % reserva(s) activa(s). Entrégalas o cancélalas primero.', v_activas;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_bloquear_borrado_con_reservas on public.bags;
create trigger trg_bloquear_borrado_con_reservas
  before delete on public.bags
  for each row execute procedure public.bloquear_borrado_con_reservas();
