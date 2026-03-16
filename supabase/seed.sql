-- =====================================================
-- RESCATE SABOR — Seed de usuarios demo
-- =====================================================
-- INSTRUCCIONES:
-- 1. Primero ejecuta schema.sql (si no lo hiciste ya)
-- 2. En Supabase → Authentication → Settings
--    desactiva "Enable email confirmations"
-- 3. Ejecuta este archivo en el SQL Editor

-- =====================================================
-- USUARIOS DEMO
-- =====================================================
-- Comprador demo:  comprador@demo.com  /  Demo1234
-- Vendedor demo:   vendedor@demo.com   /  Demo1234
-- =====================================================

-- Crear usuario comprador (via función de Supabase)
SELECT auth.create_user(
  '{"email": "comprador@demo.com", "password": "Demo1234", "email_confirm": true}'::jsonb
);

-- Crear usuario vendedor
SELECT auth.create_user(
  '{"email": "vendedor@demo.com", "password": "Demo1234", "email_confirm": true}'::jsonb
);

-- Actualizar perfiles con nombre y rol
-- (espera ~2 segundos para que el trigger cree los perfiles)
UPDATE public.profiles
SET name = 'Carlos Comprador', role = 'buyer'
WHERE email = 'comprador@demo.com';

UPDATE public.profiles
SET name = 'Sofia Vendedora', role = 'seller'
WHERE email = 'vendedor@demo.com';

-- Crear tienda para el vendedor
INSERT INTO public.stores (seller_id, name, description, address)
SELECT id, 'Panadería El Rescate', 'Pan artesanal y pasteles del día', 'Av. Principal 123'
FROM public.profiles WHERE email = 'vendedor@demo.com';

-- Crear bolsas de ejemplo
INSERT INTO public.bags (store_id, title, description, original_price, discount_price, quantity, pickup_start, pickup_end, available)
SELECT
  s.id,
  'Bolsa Sorpresa Pan 🥖',
  'Panes y medialunas del día. ¡No sabrás qué llevas!',
  1500.00,
  500.00,
  3,
  '18:00',
  '20:00',
  true
FROM public.stores s
JOIN public.profiles p ON s.seller_id = p.id
WHERE p.email = 'vendedor@demo.com';

INSERT INTO public.bags (store_id, title, description, original_price, discount_price, quantity, pickup_start, pickup_end, available)
SELECT
  s.id,
  'Caja Pastelería 🍰',
  'Tortas, alfajores y facturas. ¡Ideal para regalar!',
  2000.00,
  800.00,
  2,
  '17:00',
  '19:30',
  true
FROM public.stores s
JOIN public.profiles p ON s.seller_id = p.id
WHERE p.email = 'vendedor@demo.com';

INSERT INTO public.bags (store_id, title, description, original_price, discount_price, quantity, pickup_start, pickup_end, available)
SELECT
  s.id,
  'Mini Combo Desayuno ☕',
  'Medialunas + jugo + café. Perfecto para mañana.',
  1200.00,
  400.00,
  5,
  '07:00',
  '09:00',
  true
FROM public.stores s
JOIN public.profiles p ON s.seller_id = p.id
WHERE p.email = 'vendedor@demo.com';
