# Rescate Sabor — Accesos Demo

## Usuarios de prueba

| Rol        | Email                  | Contraseña | Nombre           |
|------------|------------------------|------------|------------------|
| Comprador  | comprador@demo.com     | Demo1234   | Carlos Comprador |
| Vendedor   | vendedor@demo.com      | Demo1234   | Sofia Vendedora  |

## Cómo crear los usuarios demo

1. Abre tu proyecto en https://supabase.com/dashboard
2. Ve a **Authentication → Settings**
   - Desactiva **"Enable email confirmations"**
3. Ve a **SQL Editor → New query**
4. Copia y ejecuta el contenido de `supabase/seed.sql`
5. Listo — los usuarios están creados con tienda y bolsas de ejemplo

## Flujo de prueba completo

### Como Vendedor
1. Inicia sesión con `vendedor@demo.com` / `Demo1234`
2. Ya tienes una tienda creada: **Panadería El Rescate**
3. Ve a **Mis bolsas** → verás 3 bolsas publicadas
4. Ve a **Reservas** → las reservas llegarán en tiempo real

### Como Comprador
1. Inicia sesión con `comprador@demo.com` / `Demo1234`
2. En **Bolsas disponibles** verás las 3 bolsas de la panadería
3. Toca **Reservar** en cualquier bolsa
4. Ve a **Mis reservas** → aparece tu ticket con estado `Pendiente`
5. Cambia al vendedor → ve que la reserva llegó en tiempo real
6. Vendedor confirma → Comprador ve `Confirmado` ✅
7. Vendedor entrega → Comprador ve `Entregado` 🎉

## URL de producción

Una vez deployado en Vercel, accedes directo desde el navegador:
```
https://rescate-sabor.vercel.app
```

No hay ruta especial de admin — el sistema de roles se maneja por:
- `/` → si eres **comprador** → dashboard de bolsas
- `/` → si eres **vendedor** → dashboard de tu tienda
