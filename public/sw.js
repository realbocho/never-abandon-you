self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: '눌러눌러', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(payload.title || '눌러눌러', {
      body: payload.body || '',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [80, 40, 80],
      tag: payload.tag || `push-${Date.now()}`, // 고유 tag → 연속 알림 각각 독립 표시
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(clients => {
      if (clients.length > 0) clients[0].focus();
      else self.clients.openWindow('/');
    })
  );
});
