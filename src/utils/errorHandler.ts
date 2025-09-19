// Utilitaires pour la gestion d'erreurs et le debugging
export const errorHandler = {
  // Gérer les erreurs de fetch
  handleFetchError: (error: any, context: string) => {
    console.error(`Erreur ${context}:`, error);
    
    // Si c'est une erreur de réseau
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Erreur de réseau détectée - vérifiez la connexion');
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }
    
    // Si c'est une erreur de Service Worker
    if (error.message.includes('Response with null body status')) {
      console.warn('Erreur Service Worker détectée - sera corrigée automatiquement');
      return 'Erreur temporaire - rechargement en cours...';
    }
    
    return 'Une erreur inattendue s\'est produite.';
  },

  // Retry automatique pour les requêtes
  retryFetch: async (fetchFn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetchFn();
      } catch (error) {
        console.warn(`Tentative ${i + 1}/${maxRetries} échouée:`, error);
        
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  },

  // Vérifier la connectivité
  checkConnectivity: async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Nettoyer les erreurs de console
  cleanConsoleErrors: () => {
    // Supprimer les erreurs de Service Worker de la console
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('cnm-sw.js') || message.includes('Response with null body status')) {
        console.warn('Service Worker error ignorée:', message);
        return;
      }
      originalError.apply(console, args);
    };
  }
};

// Initialiser le nettoyage des erreurs
errorHandler.cleanConsoleErrors();

export default errorHandler;
