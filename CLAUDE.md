# Rescate Sabor

Plataforma para rescatar comida y reducir el desperdicio alimentario.
Conecta vendedores con excedente de comida con compradores que quieren bolsas sorpresa a precio reducido.

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deploy**: Vercel

## Variables de entorno
- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

## Comandos
- `npm run dev` — Servidor de desarrollo (puerto 3000)
- `npm run build` — Build de producción
- `npm run preview` — Vista previa del build

## Setup de Supabase
1. Ejecutar `supabase/schema.sql` en el SQL Editor
2. En Authentication > Settings → desactivar "Enable email confirmations" para desarrollo
3. En Authentication > URL Configuration → agregar la URL de Vercel como Site URL

## Roles de usuario
- **buyer (comprador)**: Navega bolsas disponibles, hace reservas, ve sus tickets
- **seller (vendedor)**: Crea su tienda, publica bolsas, gestiona reservas en tiempo real

## Flujo de reserva
1. Comprador reserva una bolsa → se crea reserva con estado `pending`
2. Vendedor confirma → estado pasa a `confirmed`
3. Vendedor entrega → estado pasa a `delivered`
4. Comprador ve ticket con estado actualizado en tiempo real
