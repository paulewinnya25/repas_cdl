// Script de nettoyage agressif pour désactiver les Service Workers problématiques
// Ce script s'exécute avant tout autre code

(function() {
  'use strict';
  
  console.log('🧹 Nettoyage des Service Workers problématiques...');
  
  // Fonction pour désactiver tous les Service Workers
  const cleanupServiceWorkers = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers non supportés');
      return;
    }

    try {
      // Obtenir tous les Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔍 ${registrations.length} Service Worker(s) trouvé(s)`);

      // Désactiver tous les Service Workers problématiques
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || '';
        const scope = registration.scope;
        
        console.log(`📋 Service Worker trouvé:`, {
          scriptURL,
          scope,
          state: registration.active?.state || registration.waiting?.state
        });

        // Critères pour désactiver un Service Worker
        const shouldDisable = 
          scriptURL.includes('cnm-sw.js') ||
          scriptURL.includes('netlify') ||
          scriptURL.includes('_app') ||
          scriptURL.includes('_next') ||
          scriptURL.includes('vercel') ||
          scriptURL.includes('cloudflare') ||
          (!scriptURL.includes('/sw.js') && scope.includes(window.location.origin));

        if (shouldDisable) {
          console.log(`🗑️ Désactivation du Service Worker: ${scriptURL}`);
          await registration.unregister();
          console.log(`✅ Service Worker désactivé: ${scriptURL}`);
        } else {
          console.log(`✅ Service Worker conservé: ${scriptURL}`);
        }
      }

      // Attendre un peu puis enregistrer notre Service Worker
      setTimeout(async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker personnalisé enregistré:', registration.scope);
        } catch (error) {
          console.error('❌ Erreur enregistrement Service Worker:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  };

  // Exécuter immédiatement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupServiceWorkers);
  } else {
    cleanupServiceWorkers();
  }

  // Également exécuter après le chargement complet
  window.addEventListener('load', () => {
    setTimeout(cleanupServiceWorkers, 1000);
  });

})();
