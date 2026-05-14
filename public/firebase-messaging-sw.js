importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCmQpRVWEK_x2HV339VXOvPgdaLRa7Eszs',
  authDomain: 'railxpress-web.firebaseapp.com',
  projectId: 'railxpress-web',
  storageBucket: 'railxpress-web.firebasestorage.app',
  messagingSenderId: '6824901297',
  appId: '1:6824901297:web:0724676a32b736d5058090',
  measurementId: 'G-VD8Q582GTM',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const title = payload.notification?.title || 'RailXpress Update';
  const options = {
    body: payload.notification?.body || 'Your booking has a new update.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: payload.data?.eventType || payload.data?.notificationId || 'railxpress-notification',
    data: {
      url: payload.data?.url || payload.data?.click_action || '/dashboard',
      notificationId: payload.data?.notificationId,
    },
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client && client.url.startsWith(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
