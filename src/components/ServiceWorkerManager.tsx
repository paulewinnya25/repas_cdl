import React, { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export const ServiceWorkerManager: React.FC = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    hasError: false
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setStatus(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setStatus(prev => ({ ...prev, isSupported: true }));

    // Vérifier si un Service Worker est déjà enregistré
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const hasOurSW = registrations.some(reg => reg.scope.includes(window.location.origin));
      
      if (hasOurSW) {
        setStatus(prev => ({ ...prev, isRegistered: true }));
      } else {
        // Essayer d'enregistrer notre Service Worker
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker enregistré:', registration.scope);
            setStatus(prev => ({ ...prev, isRegistered: true }));
          })
          .catch((error) => {
            console.error('Erreur Service Worker:', error);
            setStatus(prev => ({ 
              ...prev, 
              hasError: true, 
              errorMessage: error.message 
            }));
          });
      }
    });

    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_ERROR') {
        console.error('Erreur Service Worker:', event.data.error);
        setStatus(prev => ({ 
          ...prev, 
          hasError: true, 
          errorMessage: event.data.error 
        }));
      }
    });

    // Écouter les erreurs de Service Worker
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('Erreur Service Worker globale:', event);
      setStatus(prev => ({ 
        ...prev, 
        hasError: true, 
        errorMessage: 'Erreur Service Worker globale' 
      }));
    });

  }, []);

  // Fonction pour désactiver le Service Worker problématique
  const disableProblematicSW = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        // Désactiver les Service Workers qui ne sont pas le nôtre
        if (!registration.scope.includes('/sw.js')) {
          console.log('Désactivation du Service Worker:', registration.scope);
          await registration.unregister();
        }
      }
      
      // Recharger la page pour appliquer les changements
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
  };

  // Ne rien afficher si tout fonctionne bien
  if (!status.hasError && status.isRegistered) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg z-50">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="font-semibold">Problème Service Worker détecté</p>
          <p className="text-sm">
            {status.errorMessage || 'Le Service Worker ne fonctionne pas correctement'}
          </p>
        </div>
        <button
          onClick={disableProblematicSW}
          className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
        >
          Corriger
        </button>
      </div>
    </div>
  );
};
