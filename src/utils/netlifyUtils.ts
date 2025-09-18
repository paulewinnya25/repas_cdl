// Configuration pour les fonctions Netlify
// Ce fichier peut être utilisé pour créer des fonctions serverless si nécessaire

export const NETLIFY_CONFIG = {
  // Configuration des fonctions
  FUNCTIONS: {
    TIMEOUT: 10, // 10 secondes
    MEMORY: 1024, // 1GB
  },
  
  // Configuration des redirections
  REDIRECTS: {
    SPA_FALLBACK: {
      from: '/*',
      to: '/index.html',
      status: 200
    }
  },
  
  // Configuration des headers de sécurité
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Fonction pour créer une réponse d'erreur standardisée
export const createErrorResponse = (message: string, statusCode: number = 500) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      error: message,
      timestamp: new Date().toISOString()
    })
  };
};

// Fonction pour créer une réponse de succès standardisée
export const createSuccessResponse = (data: any, statusCode: number = 200) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  };
};
