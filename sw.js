const CACHE = 'rescate-sabor-v2'
const STATIC = [
  '/rescate-sabor/',
  '/rescate-sabor/index.html',
  '/rescate-sabor/logo.svg',
  '/rescate-sabor/manifest.json'
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  // Supabase requests: siempre red
  if (url.hostname.includes('supabase')) return
  // Navegación: devuelve index.html (SPA)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/rescate-sabor/index.html'))
    )
    return
  }
  // Resto: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
