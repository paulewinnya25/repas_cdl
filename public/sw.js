// Service Worker simplifié pour l'application Repas CDL
// Ce fichier évite les conflits avec Netlify

const CACHE_NAME = 'repas-cdl-v1';

// Installation simple
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll([
          '/',
          '/index.html'
        ]);
      })
      .catch((error) => {
        console.error('Service Worker: Erreur lors de la mise en cache:', error);
      })
  );
});

// Activation simple
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  self.clients.claim();
});

// Interception basique des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes problématiques
  if (event.request.url.includes('/.netlify/functions/')) {
    return;
  }
  
  // Pour les autres requêtes, laisser passer
  return;
});

console.log('Service Worker: Chargé et prêt');
