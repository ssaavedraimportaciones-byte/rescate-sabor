#!/usr/bin/env node
/**
 * Rescate Sabor — Setup completo automático
 *
 * Usa el proyecto Supabase EXISTENTE (no crea uno nuevo).
 * Aplica el schema, desactiva confirmación de email y crea usuarios demo.
 *
 * Uso:
 *   node supabase/setup-completo.mjs
 *
 * Necesitas tu Personal Access Token de Supabase:
 *   https://supabase.com/dashboard/account/tokens
 */

import { readFileSync, writeFileSync } from 'fs'
import { createInterface } from 'readline'

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

function readEnv() {
  try {
    const content = readFileSync('.env', 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      if (!line || line.startsWith('#')) continue
      const [k, ...v] = line.split('=')
      env[k.trim()] = v.join('=').trim()
    }
    return env
  } catch {
    return {}
  }
}

// ─── pasos ─────────────────────────────────────────────────────────────────

async function getProjectRef(supabaseUrl) {
  // https://XXXX.supabase.co → XXXX
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!match) throw new Error(`URL inválida: ${supabaseUrl}`)
  return match[1]
}

async function applySchema(token, ref) {
  console.log('\n📐 Aplicando schema SQL...')
  const sql = readFileSync(
    new URL('../supabase/schema.sql', import.meta.url).pathname,
    'utf-8'
  )
  await api(token, 'POST', `/v1/projects/${ref}/database/query`, { query: sql })
  console.log('  ✓ Schema aplicado')
}

async function disableEmailConfirmation(token, ref) {
  console.log('\n📧 Desactivando confirmación de email...')
  await api(token, 'PATCH', `/v1/projects/${ref}/config/auth`, {
    mailer_autoconfirm: true,
  })
  console.log('  ✓ Listo')
}

async function createUser(token, ref, user) {
  // Intenta crear; si ya existe, obtiene el ID existente
  try {
    const created = await api(token, 'POST', `/v1/projects/${ref}/auth/users`, {
      email: user.email,
      password: user.password,
      email_confirm: true,
    })
    return { id: created.id, isNew: true }
  } catch (e) {
    if (e.message.includes('already been registered')) {
      // Buscar el usuario existente
      const list = await api(token, 'GET', `/v1/projects/${ref}/auth/users?email=${encodeURIComponent(user.email)}`)
      const existing = list.users?.find(u => u.email === user.email)
      if (existing) return { id: existing.id, isNew: false }
    }
    throw e
  }
}

async function createUsersAndData(token, ref) {
  console.log('\n👥 Creando usuarios y datos demo...')

  const USERS = [
    { email: 'comprador@rescatesabor.cl', password: 'Demo1234!', name: 'Carlos Comprador',    role: 'buyer' },
    { email: 'vendedor@rescatesabor.cl',  password: 'Demo1234!', name: 'Valentina Vendedora', role: 'seller' },
    { email: 'admin@rescatesabor.cl',     password: 'Admin1234!', name: 'Admin Rescate',       role: 'seller' },
  ]

  for (const u of USERS) {
    process.stdout.write(`  → ${u.email} ... `)

    const { id: userId, isNew } = await createUser(token, ref, u)

    if (!isNew) {
      console.log('⚠ ya existe, saltando')
      continue
    }

    // Insertar perfil con rol
    await api(token, 'POST', `/v1/projects/${ref}/database/query`, {
      query: `INSERT INTO public.profiles (id, email, name, role)
              VALUES ('${userId}', '${u.email}', '${u.name}', '${u.role}')
              ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
    })

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
          { title: 'Bolsa Sorpresa Pan', description: 'Pan del día, masas y empanadas',   original: 5000, discount: 2000, qty: 5 },
          { title: 'Bolsa Dulce',        description: 'Pasteles, galletas y brownies',     original: 8000, discount: 3500, qty: 3 },
          { title: 'Mix Panadería',      description: 'Variedad de pan, dulces y salados', original: 6000, discount: 2500, qty: 4 },
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

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   Rescate Sabor — Setup Automático     ║')
  console.log('╚════════════════════════════════════════╝\n')

  // Leer credenciales del .env actual
  const env = readEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const anonKey     = env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey || supabaseUrl.includes('TUPROJECTREF')) {
    console.error('❌ Falta VITE_SUPABASE_URL en .env')
    console.error('   Crea un proyecto en https://supabase.com y actualiza el .env')
    process.exit(1)
  }

  const ref = await getProjectRef(supabaseUrl)
  console.log(`📦 Proyecto: ${ref}`)
  console.log(`   URL: ${supabaseUrl}\n`)

  console.log('Necesitas tu Personal Access Token de Supabase.')
  console.log('Créalo aquí → https://supabase.com/dashboard/account/tokens\n')

  const token = await ask('Pega tu token: ')
  if (!token) { console.error('❌ Token requerido'); process.exit(1) }

  // Verificar token
  try {
    await api(token, 'GET', '/v1/organizations')
  } catch {
    console.error('❌ Token inválido o sin acceso')
    process.exit(1)
  }

  await applySchema(token, ref)
  await disableEmailConfirmation(token, ref)
  await createUsersAndData(token, ref)

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
  console.log('  🚀 Para levantar:  npm run dev')
  console.log('')
  console.log('  ⚙️  Secrets para GitHub Actions:')
  console.log(`      VITE_SUPABASE_URL=${supabaseUrl}`)
  console.log(`      VITE_SUPABASE_ANON_KEY=${anonKey}`)
  console.log('')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})
