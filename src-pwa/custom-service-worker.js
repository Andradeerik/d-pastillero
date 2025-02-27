/* eslint-env serviceworker */

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  console.log('PWA_FALLBACK_HTML:', process.env.PWA_FALLBACK_HTML);
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }
    )
  );
}

self.addEventListener('push', function (event) {
  try {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
      body: data.body || 'Es hora de tomar tu medicamento',
      icon: 'icons/icon-128x128.png',
      badge: 'icons/icon-128x128.png',
      vibrate: [200, 100, 200],
      tag: 'pastillero-reminder', // Evita notificaciones duplicadas
      actions: [
        { action: 'confirm', title: 'Tomar ahora' },
        { action: 'snooze', title: 'Posponer' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Recordatorio', options)
    );
  } catch (error) {
    console.error('Error al mostrar notificación:', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'confirm') {
    console.log('Usuario confirmó que tomó su medicamento');
  } else if (event.action === 'snooze') {
    console.log('Usuario pospuso la toma de medicamento');
  } else {
    // Abre la app si se hace clic en la notificación
    event.waitUntil(clients.openWindow('/'));
  }
});
