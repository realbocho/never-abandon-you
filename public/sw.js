self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: '눌러눌러', body: event.data.text() }; }

  // 고유 tag로 알림마다 독립 표시 + renotify:true로 같은 tag여도 재진동
  const tag = payload.tag || `push-${Date.now()}`;

  event.waitUntil(
    self.registration.showNotification(payload.title || '눌러눌러', {
      body: payload.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100, 50, 100],
      tag: tag,
      renotify: true,        // 같은 tag라도 반드시 새로 알림 표시
      requireInteraction: false,
      silent: false,         // 무음 방지 — 소리·진동 강제 허용
      data: { url: '/' },
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
