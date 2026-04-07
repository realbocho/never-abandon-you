self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  console.log('[SW] push event received', event.data ? 'with data' : 'no data');
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: '눌러눌러', body: event.data.text() }; }

  const tag   = `push-${Date.now()}`;
  const title = payload.title || '눌러눌러';
  const body  = payload.body  || '';

  event.waitUntil((async () => {
    // 열린 탭에 메시지 전달 (인앱 토스트)
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) {
      c.postMessage({ type: 'PUSH_RECEIVED', title, body });
    }

    // 시스템 알림 표시
    await self.registration.showNotification(title, {
      body,
      icon:               '/icon-192.png',
      badge:              '/icon-192.png',
      vibrate:            [200, 100, 200, 100, 200],
      tag,
      renotify:           true,
      requireInteraction: false,
      silent:             false,
      data:               { url: self.location.origin },
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        if ('focus' in c) return c.focus();
      }
      return self.clients.openWindow(self.location.origin);
    })
  );
});
