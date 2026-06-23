const CACHE_NAME = 'forest-focus-v1';
// Lista de arquivos que o app precisa para funcionar offline:
const ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/dashboard.js',
  './manifest.json',
  './assets/img/favicon.png'
];

// Instala o Service Worker e guarda os arquivos no Cache do celular
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Guardando arquivos essenciais no cache...');
      return cache.addAll(ASSETS);
    })
  );
});

// Intercepta os pedidos: se estiver offline, pega do cache interno
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// ==========================================
// GERENCIADOR DE CLIQUES NA NOTIFICAÇÃO
// ==========================================

self.addEventListener('notificationclick', 
  
  function(event) {
  event.notification.close(); 
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ((client.url.includes('index.html') || client.url === '/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});