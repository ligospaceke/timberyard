// Images and fonts cache-first; everything else network-first so updates are never stuck.
const C = 'enkang-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const st = /\.(jpg|png|webp|svg|woff2)$/.test(u.pathname);
  const go = () => fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(C).then((x) => x.put(r, c)); } return res; });
  e.respondWith(st ? caches.match(r).then((h) => h || go()) : go().catch(() => caches.match(r)));
});
