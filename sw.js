const CACHE_NAME = 'forest-focus-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/dashboard.js',
  './manifest.json',
  './assets/img/favicon.png',
  './assets/img/logo-192.png',
  './assets/img/logo-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});