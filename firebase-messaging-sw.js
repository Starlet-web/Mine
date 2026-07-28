importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDS0rzCKglHblF2dlFEKE-ouV0yOu0z5UM",
  authDomain: "mine-a1e68.firebaseapp.com",
  projectId: "mine-a1e68",
  storageBucket: "mine-a1e68.appspot.com",
  messagingSenderId: "48499757892",
  appId: "1:48499757892:web:d0fd281ab0df945e893d11"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification?.title || '📩 NTA Research Portal',
    {
      body: payload.notification?.body || 'New message from research partner',
      icon: 'https://csirhrdg.res.in/SiteContent/ManagedContent/ContentImage/20190311110031159csir.png',
      vibrate: [200, 100, 200]
    }
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(self.location.origin);
    })
  );
});