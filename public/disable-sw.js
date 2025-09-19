// Script de désactivation agressive du Service Worker
(function() {
  'use strict';
  
  console.log('🔧 Démarrage du nettoyage Service Worker...');
  
  // Fonction pour désactiver tous les Service Workers
  async function disableAllServiceWorkers() {
    try {
      if ('serviceWorker' in navigator) {
        // Récupérer tous les enregistrements
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`📋 ${registrations.length} Service Worker(s) trouvé(s)`);
        
        // Désactiver chaque Service Worker
        for (let registration of registrations) {
          console.log(`❌ Désactivation: ${registration.scope}`);
          await registration.unregister();
        }
        
        // Vider le cache
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          console.log(`🗑️ Suppression de ${cacheNames.length} cache(s)`);
          
          await Promise.all(
            cacheNames.map(name => {
              console.log(`🗑️ Suppression cache: ${name}`);
              return caches.delete(name);
            })
          );
        }
        
        console.log('✅ Service Workers et caches supprimés');
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }
  
  // Fonction pour bloquer les nouveaux Service Workers
  function blockNewServiceWorkers() {
    if ('serviceWorker' in navigator) {
      // Remplacer register par une fonction vide
      const originalRegister = navigator.serviceWorker.register;
      navigator.serviceWorker.register = function() {
        console.warn('🚫 Tentative d\'enregistrement SW bloquée');
        return Promise.reject(new Error('Service Worker registration blocked'));
      };
      
      // Remplacer getRegistration par une fonction vide
      const originalGetRegistration = navigator.serviceWorker.getRegistration;
      navigator.serviceWorker.getRegistration = function() {
        console.warn('🚫 Tentative d\'accès SW bloquée');
        return Promise.resolve(null);
      };
      
      console.log('🛡️ Protection contre nouveaux Service Workers activée');
    }
  }
  
  // Fonction pour nettoyer les erreurs de console
  function cleanConsoleErrors() {
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // Ignorer les erreurs de Service Worker
      if (message.includes('cnm-sw.js') || 
          message.includes('Response with null body status') ||
          message.includes('Failed to construct \'Response\'')) {
        console.warn('🚫 Erreur SW ignorée:', message);
        return;
      }
      
      originalError.apply(console, args);
    };
    
    console.log('🧹 Filtrage des erreurs SW activé');
  }
  
  // Fonction pour surveiller et nettoyer en continu
  function startContinuousCleanup() {
    setInterval(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          console.warn('⚠️ Service Worker détecté, nettoyage automatique...');
          await disableAllServiceWorkers();
        }
      }
    }, 5000); // Vérifier toutes les 5 secondes
    
    console.log('🔄 Surveillance continue activée');
  }
  
  // Exécuter le nettoyage immédiat
  disableAllServiceWorkers();
  
  // Bloquer les nouveaux Service Workers
  blockNewServiceWorkers();
  
  // Nettoyer les erreurs de console
  cleanConsoleErrors();
  
  // Démarrer la surveillance continue
  startContinuousCleanup();
  
  // Message de confirmation
  console.log('🎉 Service Worker Cleaner activé avec succès !');
  
})();
