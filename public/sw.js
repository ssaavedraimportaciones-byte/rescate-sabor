const CACHE = 'rescate-sabor-v7'
const STATIC = ['/', '/index.html', '/manifest.json']

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
  if (url.hostname.includes('supabase')) return
  // SVG/imágenes: siempre red (sin caché para ver cambios al instante)
  if (url.pathname.endsWith('.svg') || url.pathname.endsWith('.png')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 404 })))
    return
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    )
    return
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
