import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Script agressif pour désactiver le Service Worker problématique de Netlify
const disableProblematicServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    // Obtenir tous les Service Workers enregistrés
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Désactiver tous les Service Workers qui ne sont pas le nôtre
    for (const registration of registrations) {
      const scope = registration.scope;
      const scriptURL = registration.active?.scriptURL || '';
      
      // Désactiver les Service Workers problématiques
      if (
        scriptURL.includes('cnm-sw.js') || 
        scriptURL.includes('netlify') ||
        scriptURL.includes('_app') ||
        (!scriptURL.includes('/sw.js') && scope.includes(window.location.origin))
      ) {
        console.log('Désactivation du Service Worker problématique:', scriptURL);
        await registration.unregister();
      }
    }

    // Attendre un peu puis enregistrer notre Service Worker
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker personnalisé enregistré:', registration.scope);
        })
        .catch((error) => {
          console.log('Erreur enregistrement Service Worker:', error);
        });
    }, 1000);

  } catch (error) {
    console.error('Erreur lors de la désactivation des Service Workers:', error);
  }
};

// Exécuter immédiatement
disableProblematicServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
