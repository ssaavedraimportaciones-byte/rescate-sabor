-- ============================================================
-- Rescate Sabor — Borrado de cuenta (requisito de Google Play)
-- Ejecutar UNA vez en Supabase SQL Editor. Es idempotente.
--
-- Google Play exige que toda app que permita crear una cuenta
-- ofrezca borrarla desde dentro de la app Y desde una URL pública.
-- Esta función es la parte del servidor.
--
-- Al borrar la fila de auth.users, las claves foráneas ON DELETE
-- CASCADE del esquema arrastran el perfil, la tienda, sus bolsas
-- y las reservas asociadas.
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_role   text;
  v_active int;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  -- No dejamos que alguien se borre dejando compromisos abiertos con terceros:
  -- un comprador con una bolsa por retirar, o un vendedor con reservas que
  -- otras personas ya pagaron/apartaron.
  if v_role = 'buyer' then
    select count(*) into v_active
      from public.reservations
      where buyer_id = v_uid and status in ('pending', 'confirmed');
    if v_active > 0 then
      raise exception 'Tienes % reserva(s) activa(s). Cancélalas o retíralas antes de eliminar tu cuenta.', v_active;
    end if;

  elsif v_role = 'seller' then
    select count(*) into v_active
      from public.reservations r
      join public.stores s on s.id = r.store_id
      where s.seller_id = v_uid and r.status in ('pending', 'confirmed');
    if v_active > 0 then
      raise exception 'Tu tienda tiene % reserva(s) activa(s). Entrégalas o cancélalas antes de eliminar tu cuenta.', v_active;
    end if;
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

-- Solo un usuario autenticado puede invocarla, y solo borra su propia cuenta
-- (usa auth.uid(), no recibe ningún id como parámetro).
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
