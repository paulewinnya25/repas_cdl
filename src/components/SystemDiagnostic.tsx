import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimes, faRefresh } from '@fortawesome/free-solid-svg-icons';
import ServiceWorkerCleaner from './ServiceWorkerCleaner';

interface DiagnosticInfo {
  serviceWorker: boolean;
  connectivity: boolean;
  localStorage: boolean;
  errors: string[];
}

const SystemDiagnostic: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo>({
    serviceWorker: false,
    connectivity: false,
    localStorage: false,
    errors: []
  });
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const errors: string[] = [];

    // Vérifier Service Worker
    let serviceWorkerStatus = false;
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        serviceWorkerStatus = registrations.length > 0;
        if (serviceWorkerStatus) {
          errors.push(`Service Worker actif: ${registrations.length} enregistrement(s)`);
        }
      }
    } catch (error) {
      errors.push(`Erreur Service Worker: ${error}`);
    }

    // Vérifier la connectivité
    let connectivityStatus = false;
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      connectivityStatus = response.ok;
    } catch (error) {
      errors.push(`Erreur de connectivité: ${error}`);
    }

    // Vérifier localStorage
    let localStorageStatus = false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      localStorageStatus = true;
    } catch (error) {
      errors.push(`Erreur localStorage: ${error}`);
    }

    setDiagnostic({
      serviceWorker: serviceWorkerStatus,
      connectivity: connectivityStatus,
      localStorage: localStorageStatus,
      errors
    });
    setIsRunning(false);
  };

  const clearServiceWorkers = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      alert('Service Workers et caches supprimés. Rechargez la page.');
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
            Diagnostic Système
          </span>
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            {isRunning ? 'Diagnostic...' : 'Relancer'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statuts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <FontAwesomeIcon 
              icon={diagnostic.serviceWorker ? faExclamationTriangle : faCheckCircle} 
              className={`text-2xl ${diagnostic.serviceWorker ? 'text-red-500' : 'text-green-500'}`}
            />
            <p className="text-sm mt-1">Service Worker</p>
            <Badge variant={diagnostic.serviceWorker ? 'destructive' : 'default'}>
              {diagnostic.serviceWorker ? 'Problème' : 'OK'}
            </Badge>
          </div>
          
          <div className="text-center">
            <FontAwesomeIcon 
              icon={diagnostic.connectivity ? faCheckCircle : faExclamationTriangle} 
              className={`text-2xl ${diagnostic.connectivity ? 'text-green-500' : 'text-red-500'}`}
            />
            <p className="text-sm mt-1">Connectivité</p>
            <Badge variant={diagnostic.connectivity ? 'default' : 'destructive'}>
              {diagnostic.connectivity ? 'OK' : 'Problème'}
            </Badge>
          </div>
          
          <div className="text-center">
            <FontAwesomeIcon 
              icon={diagnostic.localStorage ? faCheckCircle : faExclamationTriangle} 
              className={`text-2xl ${diagnostic.localStorage ? 'text-green-500' : 'text-red-500'}`}
            />
            <p className="text-sm mt-1">Stockage</p>
            <Badge variant={diagnostic.localStorage ? 'default' : 'destructive'}>
              {diagnostic.localStorage ? 'OK' : 'Problème'}
            </Badge>
          </div>
        </div>

        {/* Erreurs détectées */}
        {diagnostic.errors.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Problèmes détectés :</h4>
            <div className="space-y-2">
              {diagnostic.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
                  <FontAwesomeIcon icon={faTimes} className="text-red-500" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={clearServiceWorkers}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Nettoyer Service Workers
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            Recharger la page
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p><strong>Conseils :</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• Si Service Worker = Problème : Utilisez le nettoyeur ci-dessous</li>
            <li>• Si Connectivité = Problème : Vérifiez votre connexion internet</li>
            <li>• Si Stockage = Problème : Videz le cache du navigateur</li>
            <li>• En cas de problème persistant : Rechargez la page</li>
          </ul>
        </div>

        {/* Nettoyeur Service Worker spécialisé */}
        {diagnostic.serviceWorker && (
          <div className="mt-4">
            <ServiceWorkerCleaner />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostic;
