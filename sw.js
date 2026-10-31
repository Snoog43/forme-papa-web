// Hors ligne : sert le cache tout de suite et le met à jour en arrière-plan.
const CACHE = 'ma-forme-20261031175634';
const FICHIERS = ['./', 'index.html', 'style.css', 'app.js', 'logic.js', 'data.js', 'menus.js', 'illustrations.js', 'player.js', 'manifest.json', 'icon.svg', 'icon-192.png'];
// cache: 'reload' contourne le cache HTTP pour prendre les fichiers fraîchement publiés.
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS.map((f) => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const enCache = await c.match(e.request);
    const reseau = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => enCache);
    return enCache || reseau;
  }));
});
