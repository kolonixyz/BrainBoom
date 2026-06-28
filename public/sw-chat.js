const CHAT_CACHE_NAME = 'brainboom-chat-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(async cached => {
      const fetchPromise = fetch(request).then(async r => {
        if (r.ok) {
          const c = await caches.open(CHAT_CACHE_NAME);
          c.put(request, r.clone());
        }
        return r;
      });
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || 'BrainBoom', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: data.roomId || 'default',
      requireInteraction: true,
      data: { url: '/papan-skor/peringkat' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
