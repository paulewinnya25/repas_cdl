// Script de nettoyage pour résoudre les erreurs de snippets obsolètes
// Ce script nettoie le cache et les références obsolètes

(function() {
  'use strict';
  
  console.log('🧹 Nettoyage des références obsolètes...');
  
  // Nettoyer le cache du navigateur
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('🗑️ Suppression du cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
  
  // Nettoyer le localStorage des références obsolètes
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('snippet') || key.includes('69c95877'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🗑️ Suppression de la clé localStorage:', key);
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Impossible de nettoyer localStorage:', error);
  }
  
  // Nettoyer le sessionStorage des références obsolètes
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('snippet') || key.includes('69c95877'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🗑️ Suppression de la clé sessionStorage:', key);
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Impossible de nettoyer sessionStorage:', error);
  }
  
  // Forcer le rechargement des ressources
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('🔄 Mise à jour du Service Worker:', registration.scope);
        registration.update();
      });
    });
  }
  
  console.log('✅ Nettoyage terminé');
})();
