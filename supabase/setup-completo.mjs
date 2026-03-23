#!/usr/bin/env node
/**
 * Rescate Sabor — Setup completo automático
 *
 * Crea un proyecto Supabase EXCLUSIVO, aplica el schema,
 * desactiva confirmación de email y crea usuarios demo.
 *
 * Uso:
 *   node supabase/setup-completo.mjs
 *
 * Solo necesitas tu Personal Access Token de Supabase:
 *   https://supabase.com/dashboard/account/tokens
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'
import { randomBytes } from 'crypto'

const API = 'https://api.supabase.com'

// ─── helpers ───────────────────────────────────────────────────────────────

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function generatePassword() {
  return 'Rs' + randomBytes(12).toString('base64url') + '!'
}

// ─── pasos ─────────────────────────────────────────────────────────────────

async function getOrg(token) {
  const orgs = await api(token, 'GET', '/v1/organizations')
  if (!orgs.length) throw new Error('No se encontraron organizaciones en tu cuenta')
  console.log(`  Organización: ${orgs[0].name} (${orgs[0].id})`)
  return orgs[0].id
}

async function createProject(token, orgId, dbPassword) {
  console.log('\n⏳ Creando proyecto rescate-sabor...')
  const project = await api(token, 'POST', '/v1/projects', {
    name: 'rescate-sabor',
    organization_id: orgId,
    db_pass: dbPassword,
    region: 'sa-east-1',
    plan: 'free',
  })
  console.log(`  ID: ${project.id}`)
  return project
}

async function waitReady(token, ref) {
  process.stdout.write('  Esperando que el proyecto esté listo')
  for (let i = 0; i < 60; i++) {
    await sleep(5000)
    const p = await api(token, 'GET', `/v1/projects/${ref}`)
    if (p.status === 'ACTIVE_HEALTHY') { console.log(' ✓'); return }
    process.stdout.write('.')
  }
  throw new Error('Timeout esperando que el proyecto esté listo')
}

async function applySchema(token, ref) {
  console.log('\n📐 Aplicando schema SQL...')
  const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf-8')
  // El endpoint acepta SQL vía Management API
  await api(token, 'POST', `/v1/projects/${ref}/database/query`, { query: sql })
  console.log('  ✓ Schema aplicado')
}

async function disableEmailConfirmation(token, ref) {
  console.log('\n📧 Desactivando confirmación de email...')
  await api(token, 'PATCH', `/v1/projects/${ref}/config/auth`, {
    mailer_autoconfirm: true,
  })
  console.log('  ✓ Email autoconfirmación activada (confirmación desactivada)')
}

async function createAdminUser(token, ref, user) {
  const created = await api(token, 'POST', `/v1/projects/${ref}/auth/users`, {
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name },
  })
  return created.id
}

async function createUsersAndData(token, ref, anonKey, supabaseUrl) {
  console.log('\n👥 Creando usuarios demo...')

  const USERS = [
    { email: 'comprador@rescatesabor.cl', password: 'Demo1234!', name: 'Carlos Comprador', role: 'buyer' },
    { email: 'vendedor@rescatesabor.cl',  password: 'Demo1234!', name: 'Valentina Vendedora', role: 'seller' },
    { email: 'admin@rescatesabor.cl',     password: 'Admin1234!', name: 'Admin Rescate', role: 'seller' },
  ]

  const sb = createClient(supabaseUrl, anonKey)

  for (const u of USERS) {
    process.stdout.write(`  → ${u.email} ... `)

    // Crear via Management API (evita email confirmation)
    const userId = await createAdminUser(token, ref, u)

    // Actualizar perfil con rol
    await api(token, 'POST', `/v1/projects/${ref}/database/query`, {
      query: `INSERT INTO public.profiles (id, email, name, role)
              VALUES ('${userId}', '${u.email}', '${u.name}', '${u.role}')
              ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
    })

    // Si es vendedor, crear tienda y bolsas
    if (u.role === 'seller') {
      const storeName = u.email.includes('admin') ? 'Rescate Sabor Admin' : 'Panadería La Esperanza'
      const storeDesc = u.email.includes('admin')
        ? 'Tienda demo del administrador'
        : 'Panadería artesanal con los mejores productos del barrio'

      const storeRes = await api(token, 'POST', `/v1/projects/${ref}/database/query`, {
        query: `INSERT INTO public.stores (seller_id, name, description, address)
                VALUES ('${userId}', '${storeName}', '${storeDesc}', 'Av. Providencia 1234, Santiago')
                RETURNING id`,
      })
      const storeId = storeRes[0]?.id

      if (storeId && !u.email.includes('admin')) {
        const bags = [
          { title: 'Bolsa Sorpresa Pan',  description: 'Pan del día, masas y empanadas',   original: 5000, discount: 2000, qty: 5 },
          { title: 'Bolsa Dulce',         description: 'Pasteles, galletas y brownies',     original: 8000, discount: 3500, qty: 3 },
          { title: 'Mix Panadería',       description: 'Variedad de pan, dulces y salados', original: 6000, discount: 2500, qty: 4 },
        ]
        for (const b of bags) {
          await api(token, 'POST', `/v1/projects/${ref}/database/query`, {
            query: `INSERT INTO public.bags (store_id, title, description, original_price, discount_price, quantity, pickup_start, pickup_end, available)
                    VALUES ('${storeId}', '${b.title}', '${b.description}', ${b.original}, ${b.discount}, ${b.qty}, '17:00', '20:00', true)`,
          })
        }
        process.stdout.write('🏪 tienda + 3 bolsas ')
      }
    }

    console.log('✓')
  }
}

function updateEnv(supabaseUrl, anonKey) {
  const content = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${anonKey}\n`
  writeFileSync('.env', content)
  console.log('\n📝 .env actualizado')
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   Rescate Sabor — Setup Automático     ║')
  console.log('╚════════════════════════════════════════╝\n')

  console.log('Necesitas tu Personal Access Token de Supabase.')
  console.log('Créalo aquí: https://supabase.com/dashboard/account/tokens\n')

  const token = await ask('Pega tu token aquí: ')
  if (!token) { console.error('❌ Token requerido'); process.exit(1) }

  // Verificar token
  let orgs
  try {
    orgs = await api(token, 'GET', '/v1/organizations')
  } catch (e) {
    console.error('❌ Token inválido o sin acceso:', e.message)
    process.exit(1)
  }

  const dbPassword = generatePassword()
  console.log(`\n🔑 Contraseña DB (guardada automáticamente): ${dbPassword}`)

  // Flujo
  const orgId   = await getOrg(token)
  const project = await createProject(token, orgId, dbPassword)
  const ref     = project.id

  await waitReady(token, ref)
  await applySchema(token, ref)
  await disableEmailConfirmation(token, ref)

  // Obtener credenciales del proyecto nuevo
  console.log('\n🔑 Obteniendo credenciales...')
  const keys = await api(token, 'GET', `/v1/projects/${ref}/api-keys`)
  const anonKey     = keys.find(k => k.name === 'anon')?.api_key
  const supabaseUrl = `https://${ref}.supabase.co`

  if (!anonKey) throw new Error('No se pudo obtener la anon key')
  console.log(`  URL: ${supabaseUrl}`)

  await createUsersAndData(token, ref, anonKey, supabaseUrl)
  updateEnv(supabaseUrl, anonKey)

  console.log('\n══════════════════════════════════════════')
  console.log('  ✅ Setup completo!')
  console.log('══════════════════════════════════════════')
  console.log('')
  console.log('  🛍️  Comprador:')
  console.log('      Email:    comprador@rescatesabor.cl')
  console.log('      Password: Demo1234!')
  console.log('')
  console.log('  🏪 Vendedor:')
  console.log('      Email:    vendedor@rescatesabor.cl')
  console.log('      Password: Demo1234!')
  console.log('')
  console.log('  👑 Admin:')
  console.log('      Email:    admin@rescatesabor.cl')
  console.log('      Password: Admin1234!')
  console.log('')
  console.log('  🚀 Para levantar el proyecto:')
  console.log('      npm run dev')
  console.log('')
  console.log('  ⚙️  Para GitHub Actions, agrega estos secrets:')
  console.log(`      VITE_SUPABASE_URL=${supabaseUrl}`)
  console.log(`      VITE_SUPABASE_ANON_KEY=${anonKey}`)
  console.log('')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})
