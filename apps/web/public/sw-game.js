const CACHE_NAME = 'brainboom-game-v1';
const GAME_ASSETS = ['/', '/manifest.json', '/robots.txt', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await Promise.allSettled(
                GAME_ASSETS.map(url => fetch(url).then(r => r.ok ? cache.put(url, r) : null).catch(() => null))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && !k.startsWith('brainboom-chat')).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET') return;
    if (!isGameAsset(url.pathname)) return;
    event.respondWith(
        caches.match(request).then(async cached => {
            if (cached) {
                fetch(request).then(async r => { if (r.ok) { const c = await caches.open(CACHE_NAME); c.put(request, r.clone()); } }).catch(() => {});
                return cached;
            }
            return fetch(request).then(async r => {
                if (r.ok) { const c = await caches.open(CACHE_NAME); c.put(request, r.clone()); }
                return r;
            }).catch(() => caches.match('/'));
        })
    );
});

function isGameAsset(path) {
    const gamePaths = ['/', '/manifest.json', '/robots.txt', '/icons/'];
    return gamePaths.some(p => path.startsWith(p)) || path.match(/\.(js|css|woff2?)$/);
}
