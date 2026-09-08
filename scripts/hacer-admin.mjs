#!/usr/bin/env node
/**
 * Asigna el rol admin a una cuenta ya registrada.
 *
 * Nadie puede auto-asignarse admin desde la app (lo impide un trigger), así que
 * el primer administrador se otorga desde aquí. Este script usa la clave
 * service_role, que actúa como contexto de confianza y sí puede cambiar el rol.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/hacer-admin.mjs tu@correo.com
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'

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
const EMAIL = process.argv[2]

if (!EMAIL) {
  console.error('\n✖ Falta el correo.\n\n  node scripts/hacer-admin.mjs tu@correo.com\n')
  process.exit(1)
}
if (!URL || !KEY) {
  console.error('\n✖ Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.')
  console.error('  La service_role está en: Supabase → Project Settings → API\n')
  process.exit(1)
}

const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const { data: perfil, error: e1 } = await db
  .from('profiles').select('id, email, role').eq('email', EMAIL).maybeSingle()

if (e1) { console.error('\n✖', e1.message, '\n'); process.exit(1) }
if (!perfil) {
  console.error(`\n✖ No hay ninguna cuenta con el correo ${EMAIL}.`)
  console.error('  Regístrate primero en la app y vuelve a correr esto.\n')
  process.exit(1)
}

const { error: e2 } = await db.from('profiles').update({ role: 'admin' }).eq('id', perfil.id)
if (e2) { console.error('\n✖', e2.message, '\n'); process.exit(1) }

// Confirma que el cambio quedó guardado (el trigger podría haberlo revertido)
const { data: check } = await db.from('profiles').select('role').eq('id', perfil.id).single()
if (check?.role !== 'admin') {
  console.error(`\n✖ El rol volvió a "${check?.role}". ¿Ejecutaste supabase/security_hardening.sql?\n`)
  process.exit(1)
}

console.log(`\n✓ ${EMAIL} ahora es admin. Cierra sesión y vuelve a entrar para ver el panel.\n`)
