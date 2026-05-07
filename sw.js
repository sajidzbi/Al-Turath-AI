/* ═══════════════════════════════════════════════
   Al-Turath AI — Service Worker
   ⚡ جب بھی اپڈیٹ کریں، صرف یہ نمبر بدلیں:
   ═══════════════════════════════════════════════ */
var APP_VERSION = 'al-turath-v2026.1';

var FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(APP_VERSION).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== APP_VERSION; })
          .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'APP_UPDATED', version: APP_VERSION });
        });
      });
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function(networkResponse) {
        var responseClone = networkResponse.clone();
        caches.open(APP_VERSION).then(function(cache) {
          cache.put(e.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function() {
        return caches.match(e.request).then(function(r) {
          return r || caches.match('./index.html');
        });
      })
  );
});
