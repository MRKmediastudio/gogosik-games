// Offline cache for Gogosik's Matchsticks. Bump VERSION when files change.
const VERSION = 'matchsticks-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-64.png', './img/gogosik-idle.webp', './img/gogosik-think.webp', './img/gogosik-oops.webp', './img/gogosik-happy.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('matchsticks-') && k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  // network-first for the page so updates show up; cache fallback offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('./', c)); return r; }).catch(() => caches.match('./')));
    return;
  }
  // stale-while-revalidate for everything else (icons, Google Fonts)
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req);
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
