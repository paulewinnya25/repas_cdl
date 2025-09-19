import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRefresh, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ServiceWorkerCleaner: React.FC = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [cleanupCount, setCleanupCount] = useState(0);

  const performDeepCleanup = async () => {
    setIsCleaning(true);
    
    try {
      // 1. Désactiver tous les Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`🧹 Nettoyage de ${registrations.length} Service Worker(s)`);
        
        for (let registration of registrations) {
          await registration.unregister();
          console.log(`❌ Supprimé: ${registration.scope}`);
        }
      }

      // 2. Vider tous les caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`🗑️ Suppression de ${cacheNames.length} cache(s)`);
        
        await Promise.all(
          cacheNames.map(name => {
            console.log(`🗑️ Cache supprimé: ${name}`);
            return caches.delete(name);
          })
        );
      }

      // 3. Vider le localStorage des erreurs
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('sw') || key.includes('cache') || key.includes('service'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ localStorage nettoyé: ${key}`);
      });

      // 4. Forcer le rechargement des ressources
      if ('serviceWorker' in navigator) {
        // Bloquer définitivement les nouveaux SW
        navigator.serviceWorker.register = function() {
          console.warn('🚫 Nouveau Service Worker bloqué');
          return Promise.reject(new Error('Service Worker blocked'));
        };
      }

      setLastCleanup(new Date());
      setCleanupCount(prev => prev + 1);
      
      console.log('✅ Nettoyage profond terminé');
      
      // Afficher un message de succès
      alert('🧹 Nettoyage terminé ! Les Service Workers ont été supprimés.\n\nRechargez la page pour voir les changements.');
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      alert('❌ Erreur lors du nettoyage. Vérifiez la console pour plus de détails.');
    } finally {
      setIsCleaning(false);
    }
  };

  const forceReload = () => {
    // Vider le cache du navigateur et recharger
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          Nettoyage Service Worker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-red-600">
          <p><strong>Problème détecté :</strong> Service Worker `cnm-sw.js` cause des erreurs</p>
          <p><strong>Solution :</strong> Nettoyage profond et suppression complète</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-2xl mb-2" />
            <p className="text-sm font-medium">Nettoyages effectués</p>
            <p className="text-lg font-bold text-red-600">{cleanupCount}</p>
          </div>
          
          <div className="text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl mb-2" />
            <p className="text-sm font-medium">Dernier nettoyage</p>
            <p className="text-xs text-gray-600">
              {lastCleanup ? lastCleanup.toLocaleTimeString() : 'Jamais'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={performDeepCleanup}
            disabled={isCleaning}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            {isCleaning ? 'Nettoyage...' : 'Nettoyage Profond'}
          </Button>
          
          <Button
            onClick={forceReload}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            Recharger
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <p><strong>Instructions :</strong></p>
          <ol className="mt-1 space-y-1 list-decimal list-inside">
            <li>Cliquez sur "Nettoyage Profond"</li>
            <li>Attendez la confirmation</li>
            <li>Cliquez sur "Recharger"</li>
            <li>Vérifiez que les erreurs ont disparu</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceWorkerCleaner;
