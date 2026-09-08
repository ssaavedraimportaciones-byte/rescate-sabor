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
2. Sobre una base que ya existía, ejecutar además `supabase/security_hardening.sql`
3. En Authentication > Settings → desactivar "Enable email confirmations" para desarrollo
4. En Authentication > URL Configuration → agregar la URL de Vercel como Site URL

## Roles de usuario
- **buyer (comprador)**: Navega bolsas disponibles, hace reservas, ve sus tickets
- **seller (vendedor)**: Crea su tienda, publica bolsas, gestiona reservas en tiempo real
- **admin**: Panel con métricas globales, usuarios, tiendas y reservas; puede cambiar
  el rol de cualquier usuario

`admin` no se puede elegir al registrarse: el registro público solo acepta
`buyer`/`seller` y un trigger impide que alguien se cambie el rol a sí mismo. El
primer admin se otorga desde el SQL Editor (última sección de
`security_hardening.sql`); desde ahí ese admin puede promover a otros.

## Marca
- Todo uso del logo pasa por `src/components/Logo.jsx` (`<Logo/>` y `<LogoMark/>`).
  El SVG es cuadrado: no meterlo en cajas con proporción distinta.
- Los colores y degradados viven en `src/lib/brand.js`. Regla: el verde es la marca
  (superficies) y el naranja es la acción (botones). No interpolar verde → naranja en
  un mismo degradado — en sRGB pasa por un oliva apagado.
- La iconografía es `lucide-react`, no emoji.
- Los PNG de `public/` (favicons, icono iOS/PWA, og-image) se derivan de `logo.svg`.

## Flujo de reserva
1. Comprador reserva una bolsa → se crea reserva con estado `pending`
2. Vendedor confirma → estado pasa a `confirmed`
3. Vendedor entrega → estado pasa a `delivered`
4. Comprador ve ticket con estado actualizado en tiempo real
