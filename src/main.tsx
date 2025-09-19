import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Script pour désactiver tous les Service Workers problématiques
const disableAllServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    console.log('🧹 Désactivation de tous les Service Workers...');
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Désactiver tous les Service Workers
    for (const registration of registrations) {
      const scriptURL = registration.active?.scriptURL || '';
      console.log('🗑️ Désactivation du Service Worker:', scriptURL);
      await registration.unregister();
    }

    console.log('✅ Tous les Service Workers désactivés');
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation des Service Workers:', error);
  }
};

// Désactiver tous les Service Workers au démarrage
disableAllServiceWorkers();

createRoot(document.getElementById("root")!).render(<App />);
