/* Node2 service worker — minimal, safe offline shell.
 *
 * Strategy:
 *   - Navigations (HTML): network-first, fall back to a cached offline shell.
 *     Payroll data is live and sensitive, so we never serve stale app HTML when
 *     the network is available — we only fall back when truly offline.
 *   - Static assets (/_next/static, icons, images): cache-first (they're
 *     content-hashed, so cache-first is safe and fast).
 *   - API requests (/api/*): always network, never cached (never cache payroll
 *     data or auth responses).
 *
 * Bump CACHE_VERSION to invalidate old caches on deploy.
 */
const CACHE_VERSION = "node2-v1"
const STATIC_CACHE = `${CACHE_VERSION}-static`
const OFFLINE_URL = "/offline"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL])).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never cache API or auth traffic — always go to network.
  if (url.pathname.startsWith("/api/")) return

  // Static, content-hashed assets: cache-first.
  if (url.pathname.startsWith("/_next/static") || /\.(svg|png|jpg|jpeg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {})
            return res
          }),
      ),
    )
    return
  }

  // Navigations: network-first, offline shell as fallback.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
  }
})
