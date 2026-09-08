-- Fix: el nombre y rol elegidos en el registro no se guardaban cuando
-- la confirmación de email está pendiente (el trigger solo guardaba el email,
-- y el cliente no tiene sesión todavía para hacer el upsert por su cuenta —
-- la política RLS lo bloquea). Resultado: el usuario quedaba con role = NULL
-- y la app lo regresaba al login en bucle.
--
-- Ejecutar en Supabase SQL Editor.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role')
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    role = coalesce(excluded.role, public.profiles.role);
  return new;
end;
$$ language plpgsql security definer;

-- Repara cuentas ya existentes que quedaron sin rol: toma el rol guardado
-- en los metadatos de auth.users (si lo tienen) y lo aplica al perfil.
update public.profiles p
set role = u.raw_user_meta_data->>'role',
    name = coalesce(p.name, u.raw_user_meta_data->>'name')
from auth.users u
where u.id = p.id
  and p.role is null
  and u.raw_user_meta_data->>'role' is not null;
