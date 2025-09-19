import React, { useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ResourceErrorHandler: React.FC<ErrorBoundaryProps> = ({ children }) => {
  useEffect(() => {
    // Gestionnaire d'erreurs global pour les ressources obsolètes
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('snippet') || event.message.includes('69c95877')) {
        console.warn('🚨 Erreur de ressource obsolète détectée:', event.message);
        
        // Nettoyer les références obsolètes
        try {
          // Nettoyer le cache
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                if (cacheName.includes('snippet') || cacheName.includes('69c95877')) {
                  caches.delete(cacheName);
                }
              });
            });
          }
          
          // Nettoyer localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('snippet') || key.includes('69c95877'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          console.log('✅ Références obsolètes nettoyées');
        } catch (error) {
          console.warn('Impossible de nettoyer les références obsolètes:', error);
        }
      }
    };

    // Ajouter le gestionnaire d'erreurs
    window.addEventListener('error', handleError);
    
    // Nettoyage au démontage
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
};

export default ResourceErrorHandler;
