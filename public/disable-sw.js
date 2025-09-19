// Désactiver le Service Worker problématique
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Désactivation du Service Worker:', registration.scope);
      registration.unregister();
    }
  });
}

// Nettoyer le cache
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      console.log('Suppression du cache:', name);
      caches.delete(name);
    }
  });
}

console.log('Service Workers et caches nettoyés');
