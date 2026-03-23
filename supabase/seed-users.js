/**
 * Rescate Sabor — Crear usuarios demo
 *
 * Ejecutar con: node supabase/seed-users.js
 *
 * Requiere las variables de entorno en .env
 * Crea 3 usuarios: comprador, vendedor, y admin
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Leer .env manualmente
const envFile = readFileSync('.env', 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
)

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const USERS = [
  { email: 'comprador@rescatesabor.cl', password: 'Demo1234!', name: 'Carlos Comprador', role: 'buyer' },
  { email: 'vendedor@rescatesabor.cl', password: 'Demo1234!', name: 'Valentina Vendedora', role: 'seller' },
  { email: 'admin@rescatesabor.cl',     password: 'Admin1234!', name: 'Admin Rescate', role: 'seller' },
]

async function seedUsers() {
  console.log('🌱 Creando usuarios demo...\n')

  for (const u of USERS) {
    console.log(`  → ${u.email} (${u.role})`)

    // 1. Crear usuario en Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log(`    ⚠ Ya existe, saltando...`)
        continue
      }
      console.error(`    ❌ Error: ${signUpError.message}`)
      continue
    }

    if (!data.user) {
      console.error(`    ❌ No se creó el usuario`)
      continue
    }

    // 2. Actualizar perfil con nombre y rol
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, email: u.email, name: u.name, role: u.role })

    if (profileError) {
      console.error(`    ❌ Error perfil: ${profileError.message}`)
      continue
    }

    // 3. Si es vendedor, crear tienda demo
    if (u.role === 'seller') {
      // Necesitamos estar autenticados como el usuario para crear la tienda
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: u.email,
        password: u.password,
      })

      if (!loginError) {
        const storeName = u.email.includes('admin') ? 'Rescate Sabor Admin' : 'Panadería La Esperanza'
        const { data: store } = await supabase
          .from('stores')
          .insert({
            seller_id: data.user.id,
            name: storeName,
            description: u.email.includes('admin')
              ? 'Tienda demo del administrador'
              : 'Panadería artesanal con los mejores productos del barrio',
            address: 'Av. Providencia 1234, Santiago',
          })
          .select()
          .single()

        if (store) {
          console.log(`    🏪 Tienda creada: ${storeName}`)

          // Crear bolsas demo
          const bags = [
            { title: 'Bolsa Sorpresa Pan', description: 'Pan del día, masas y empanadas', original_price: 5000, discount_price: 2000, quantity: 5 },
            { title: 'Bolsa Dulce', description: 'Pasteles, galletas y brownies', original_price: 8000, discount_price: 3500, quantity: 3 },
            { title: 'Mix Panadería', description: 'Variedad de pan, dulces y salados', original_price: 6000, discount_price: 2500, quantity: 4 },
          ]

          for (const bag of bags) {
            await supabase.from('bags').insert({
              store_id: store.id,
              ...bag,
              pickup_start: '17:00',
              pickup_end: '20:00',
              available: true,
            })
          }
          console.log(`    🥡 ${bags.length} bolsas demo creadas`)
        }

        await supabase.auth.signOut()
      }
    }

    console.log(`    ✅ Listo`)
  }

  console.log('\n══════════════════════════════════════')
  console.log('  ✅ Usuarios demo creados')
  console.log('══════════════════════════════════════')
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
}

seedUsers().catch(console.error)
