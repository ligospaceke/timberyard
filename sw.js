const C='pty-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.includes('/public/'))return;
e.respondWith(caches.open(C).then(c=>c.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}))))});
