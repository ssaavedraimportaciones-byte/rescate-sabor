/**
 * Service worker de Rescate Sabor — SOLO pantalla offline.
 *
 * Contexto: una versión anterior cacheaba el HTML y los bundles de la app, y
 * después de cada despliegue los usuarios seguían viendo la versión vieja. Este
 * archivo está escrito para que ese problema NO pueda repetirse:
 *
 *   1. Lo único que se guarda en caché es /offline.html. Nunca se cachea el
 *      index.html, ni el JS, ni el CSS, ni las respuestas de la API.
 *   2. Solo se interceptan las navegaciones (request.mode === 'navigate').
 *      Todo lo demás pasa directo a la red, sin tocarlo.
 *   3. Incluso en una navegación, la red va primero y su respuesta se devuelve
 *      tal cual. La caché solo entra si el fetch REALMENTE falla (sin conexión).
 *
 * O sea: mientras haya red, el usuario siempre recibe lo último desplegado.
 *
 * Existe porque Google evalúa que una TWA no muestre la pantalla de error del
 * navegador cuando no hay conexión.
 */

const CACHE = 'rescate-sabor-offline-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      // Borra cualquier caché de versiones anteriores del service worker.
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET' || req.mode !== 'navigate') return

  event.respondWith(
    fetch(req).catch(() => caches.match(OFFLINE_URL))
  )
})
