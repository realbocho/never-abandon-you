self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: '눌러눌러', body: event.data.text() }; }

  const tag   = payload.tag || `push-${Date.now()}`;
  const title = payload.title || '눌러눌러';
  const body  = payload.body  || '';

  event.waitUntil((async () => {
    // 열려있는 탭에 메시지 전달 (인앱 토스트 업데이트용)
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'PUSH_RECEIVED', title, body, tag });
    }

    // 항상 시스템 알림 표시 — 포그라운드/백그라운드 무관
    await self.registration.showNotification(title, {
      body,
      icon:               '/icon-192.png',
      badge:              '/icon-192.png',
      vibrate:            [200, 100, 200, 100, 200],
      tag,
      renotify:           true,
      requireInteraction: false,
      silent:             false,
      data:               { url: '/' },
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
