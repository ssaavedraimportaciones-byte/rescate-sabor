-- ============================================================
-- MIGRACIÓN: Funciones atómicas de reserva
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. Reservar bolsa (atómica + anti race-condition)
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
  -- Lock fila para evitar que dos compradores reserven el mismo ítem
  select quantity into v_qty from public.bags where id = p_bag_id for update;
  if v_qty is null or v_qty < 1 then
    raise exception 'Sin stock disponible';
  end if;
  insert into public.reservations (bag_id, buyer_id, store_id)
    values (p_bag_id, auth.uid(), p_store_id)
    returning id into v_reservation_id;
  update public.bags
    set quantity  = quantity - 1,
        available = (quantity - 1) > 0
    where id = p_bag_id;
  return v_reservation_id;
end;
$$;

-- 2. Cancelar reserva (devuelve stock al inventario)
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

-- Verificación rápida (debe retornar las dos funciones)
select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('reserve_bag', 'cancel_reservation');
