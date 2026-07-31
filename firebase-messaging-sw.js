// firebase-messaging-sw.js
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

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background notification:', payload);
  
  const notificationTitle = payload.notification?.title || 'CSIR NET Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New research update',
    icon: 'https://csirhrdg.res.in/SiteContent/ManagedContent/ContentImage/20190311110031159csir.png',
    badge: 'https://csirhrdg.res.in/SiteContent/ManagedContent/ContentImage/20190311110031159csir.png',
    tag: 'csir-net-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {}
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});