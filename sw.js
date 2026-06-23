const CACHE_NAME = 'forest-focus-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/dashboard.js',
  './manifest.json',
  './assets/img/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Guardando arquivos essenciais no cache...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.clients.claim().then(() => {
      return verificarEAgendarAlertas();
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// ==========================================
// LÓGICA DE AGENDAMENTO SEGUNDO PLANO
// ==========================================

function verificarEAgendarAlertas() {
  const alertas = [
    { id: 'manha', hora: 8, minuto: 0, titulo: 'Foco Inicial! 🚀', texto: 'Novo dia, novas metas. Abra o Forest Focus e organize suas prioridades.' },
    { id: 'tarde', hora: 14, minuto: 35, titulo: 'Check-in de Produtividade! 📊', texto: 'Não perca o ritmo! Dê uma olhada no que ainda falta concluir hoje.' },
    { id: 'noite', hora: 22, minuto: 0, titulo: 'Revisão Concluída? 🌳', texto: 'Hora de fechar a conta! Registre seus gastos antes de dormir e prepare o terreno para amanhã.' }
  ];

  alertas.forEach(alerta => {
    const agora = new Date();
    let momentoAlarme = new Date();
    momentoAlarme.setHours(alerta.hora, alerta.minuto, 0, 0);

    if (momentoAlarme <= agora) {
      momentoAlarme.setDate(momentoAlarme.getDate() + 1);
    }

    const tempoRestante = momentoAlarme.getTime() - agora.getTime();

    setTimeout(() => {
      self.registration.showNotification(alerta.titulo, {
        body: alerta.texto,
        icon: 'assets/img/logo-192.png',
        badge: 'assets/img/favicon.png',
        tag: alerta.id
      });
    }, tempoRestante);
    
    console.log(`[SW] Alarme da ${alerta.id} configurado para daqui a ${Math.round(tempoRestante/1000/60)} minutos.`);
  });
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'RECALIBRAR_ALARMES') {
    verificarEAgendarAlertas();
  }
});

self.addEventListener('notificationclick', function(event) {
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