// Service Worker personnalisé pour remplacer celui de Netlify
// Ce fichier résout les problèmes de Response avec body null

const CACHE_NAME = 'repas-cdl-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/logo-centre-diagnostic-official.svg'
];

// Désactiver immédiatement tous les autres Service Workers
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation - Désactivation des autres SW');
  
  // Prendre immédiatement le contrôle
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Désactiver les autres Service Workers
      self.registration.unregister().catch(() => {}),
      // Puis réenregistrer notre propre SW
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Mise en cache des fichiers statiques');
          return cache.addAll(STATIC_CACHE_URLS);
        })
        .catch((error) => {
          console.error('Service Worker: Erreur lors de la mise en cache:', error);
        })
    ])
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers les fonctions Netlify problématiques
  if (event.request.url.includes('/.netlify/functions/fetch-site-configuration')) {
    console.log('Service Worker: Ignorer la requête problématique:', event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourner la réponse mise en cache si disponible
        if (cachedResponse) {
          return cachedResponse;
        }

        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse pour la mise en cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Erreur de requête réseau:', error);
            
            // Retourner une réponse d'erreur appropriée
            return new Response(
              JSON.stringify({ error: 'Réseau indisponible' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Chargé et prêt');
