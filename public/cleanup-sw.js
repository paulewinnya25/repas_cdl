// Script de nettoyage simplifié pour les Service Workers problématiques
// Ce script s'exécute une seule fois au chargement de la page

(function() {
  'use strict';
  
  // Éviter les exécutions multiples
  if (window.serviceWorkerCleanupDone) {
    return;
  }
  window.serviceWorkerCleanupDone = true;
  
  console.log('🧹 Nettoyage des Service Workers problématiques...');
  
  const cleanupServiceWorkers = async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || '';
        
        // Désactiver seulement les Service Workers problématiques
        if (scriptURL.includes('cnm-sw.js') || scriptURL.includes('netlify') || scriptURL.includes('sw.js')) {
          console.log(`🗑️ Désactivation du Service Worker: ${scriptURL}`);
          await registration.unregister();
        }
      }
      
      console.log('✅ Nettoyage terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  };

  // Exécuter une seule fois
  cleanupServiceWorkers();
})();
