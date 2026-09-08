#!/usr/bin/env node
/**
 * Crea las cuentas de demostración que Google pide para revisar la app.
 *
 * Usa la clave service_role (no la anon) por dos razones:
 *  - Marca los correos como confirmados, así funcionan aunque tengas activada
 *    la confirmación por email en Supabase.
 *  - Puede crear la tienda y las bolsas del vendedor sin pelear con las RLS.
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/crear-demo.mjs
 *
 * O deja esas dos variables en un archivo .env en la raíz.
 *
 * Es idempotente: si las cuentas ya existen, no las duplica.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'

// --- credenciales ---
const env = { ...process.env }
if (existsSync('.env')) {
  for (const linea of readFileSync('.env', 'utf-8').split('\n')) {
    const l = linea.trim()
    if (!l || l.startsWith('#')) continue
    const i = l.indexOf('=')
    if (i > 0) env[l.slice(0, i).trim()] ??= l.slice(i + 1).trim()
  }
}

const URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error(`
✖ Faltan credenciales.

  Necesitas la clave service_role (NO la anon). Está en:
  Supabase → Project Settings → API → service_role · secret

  Luego:
    SUPABASE_URL=${URL || 'https://TU-PROYECTO.supabase.co'} \\
    SUPABASE_SERVICE_ROLE_KEY=eyJ... \\
    node scripts/crear-demo.mjs

  Esa clave salta todas las reglas de seguridad: úsala solo en tu terminal,
  nunca la subas al repo ni la pongas en el frontend.
`)
  process.exit(1)
}

const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const CUENTAS = [
  { email: 'comprador@rescatesabor.cl', password: 'Demo1234!', name: 'Camila Compradora', role: 'buyer' },
  { email: 'vendedor@rescatesabor.cl',  password: 'Demo1234!', name: 'Valentina Vendedora', role: 'seller' },
]

const TIENDA = {
  name: 'Panadería La Esperanza',
  description: 'Panadería artesanal del barrio. Publicamos el excedente del día.',
  address: 'Av. Providencia 1234, Santiago',
}

const BOLSAS = [
  { title: 'Bolsa sorpresa de panadería', description: 'Pan, pasteles y masas del día', original_price: 12000, discount_price: 4000, quantity: 4, pickup_start: '19:00', pickup_end: '20:30' },
  { title: 'Bolsa dulce',                 description: 'Kuchen, galletas y brownies',   original_price: 9000,  discount_price: 3500, quantity: 3, pickup_start: '18:30', pickup_end: '20:00' },
  { title: 'Mix salado',                  description: 'Empanadas y pan amasado',       original_price: 8000,  discount_price: 3000, quantity: 5, pickup_start: '18:00', pickup_end: '19:30' },
]

async function buscarPorEmail(email) {
  // listUsers pagina; para un proyecto de este tamaño una página basta
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw new Error(`No se pudo listar usuarios: ${error.message}`)
  return data.users.find(u => u.email === email) || null
}

async function crearCuenta(c) {
  const existente = await buscarPorEmail(c.email)
  if (existente) {
    console.log(`  · ${c.email} — ya existía`)
    return existente
  }
  const { data, error } = await db.auth.admin.createUser({
    email: c.email,
    password: c.password,
    email_confirm: true,                       // queda confirmada sin recibir correo
    user_metadata: { name: c.name, role: c.role },
  })
  if (error) throw new Error(`No se pudo crear ${c.email}: ${error.message}`)
  console.log(`  ✓ ${c.email} — creada`)
  return data.user
}

async function main() {
  console.log('\nCreando cuentas de demostración...\n')

  const creadas = {}
  for (const c of CUENTAS) creadas[c.role] = await crearCuenta(c)

  // Verifica que el trigger haya asignado bien el rol. Si esto falla, es señal
  // de que falta ejecutar supabase/security_hardening.sql.
  console.log('\nVerificando roles en la tabla profiles...\n')
  let rolesOk = true
  for (const c of CUENTAS) {
    const { data: perfil } = await db.from('profiles').select('role, name').eq('id', creadas[c.role].id).single()
    const ok = perfil?.role === c.role
    rolesOk &&= ok
    console.log(`  ${ok ? '✓' : '✖'} ${c.email} → rol "${perfil?.role ?? 'sin rol'}" (esperado "${c.role}")`)
  }

  if (!rolesOk) {
    console.error(`
✖ Los roles no quedaron bien.

  Casi seguro falta ejecutar supabase/security_hardening.sql en el SQL Editor:
  ese archivo actualiza el trigger handle_new_user() para que lea el rol desde
  los metadatos del alta. Ejecútalo y vuelve a correr este script.
`)
    process.exit(1)
  }

  // Tienda y bolsas del vendedor, para que el revisor no vea la app vacía
  const vendedorId = creadas.seller.id
  let { data: tienda } = await db.from('stores').select('*').eq('seller_id', vendedorId).maybeSingle()

  if (!tienda) {
    const { data, error } = await db.from('stores')
      .insert({ seller_id: vendedorId, ...TIENDA }).select().single()
    if (error) throw new Error(`No se pudo crear la tienda: ${error.message}`)
    tienda = data
    console.log(`\n  ✓ Tienda creada: ${tienda.name}`)
  } else {
    console.log(`\n  · Tienda ya existía: ${tienda.name}`)
  }

  const { data: yaHay } = await db.from('bags').select('id').eq('store_id', tienda.id)
  if (!yaHay?.length) {
    const { error } = await db.from('bags')
      .insert(BOLSAS.map(b => ({ ...b, store_id: tienda.id, available: true })))
    if (error) throw new Error(`No se pudieron crear las bolsas: ${error.message}`)
    console.log(`  ✓ ${BOLSAS.length} bolsas publicadas`)
  } else {
    console.log(`  · La tienda ya tenía ${yaHay.length} bolsa(s)`)
  }

  console.log(`
─────────────────────────────────────────────
  Credenciales para Play Console
  (Contenido de la app → Acceso a la app)
─────────────────────────────────────────────

  COMPRADOR
    ${CUENTAS[0].email}
    ${CUENTAS[0].password}

  VENDEDOR
    ${CUENTAS[1].email}
    ${CUENTAS[1].password}

  No borres estas cuentas: Google las reutiliza en cada
  actualización que envíes.
`)
}

main().catch(e => { console.error('\n✖', e.message, '\n'); process.exit(1) })
