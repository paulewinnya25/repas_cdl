// Configuration pour la gestion des erreurs d'images
export const IMAGE_CONFIG = {
  // URLs de fallback pour les images
  FALLBACK_IMAGES: {
    MENU_PLACEHOLDER: '/images/menu-placeholder.svg',
    LOGO_FALLBACK: 'https://res.cloudinary.com/dd64mwkl2/image/upload/v1734533177/Centre_Diagnostic-Logo_cyekdg.svg',
    USER_AVATAR: '/images/user-avatar.svg'
  },
  
  // Configuration des timeouts
  LOAD_TIMEOUT: 5000, // 5 secondes
  
  // Formats d'images supportés
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  // Tailles maximales
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Fonction utilitaire pour vérifier si une URL d'image est valide
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'data:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Fonction pour créer un placeholder d'image
export const createImagePlaceholder = (width: number, height: number, text: string = 'Image'): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Fonction pour gérer les erreurs d'images avec retry
export const handleImageError = (img: HTMLImageElement, retryCount: number = 0): void => {
  const maxRetries = 2;
  
  if (retryCount < maxRetries) {
    // Retry avec un timestamp pour éviter le cache
    const originalSrc = img.src.split('?')[0];
    img.src = `${originalSrc}?retry=${retryCount}&t=${Date.now()}`;
    
    img.onerror = () => handleImageError(img, retryCount + 1);
  } else {
    // Afficher le placeholder après échec des tentatives
    console.warn('Échec du chargement de l\'image après', maxRetries, 'tentatives:', img.src);
    img.style.display = 'none';
    
    // Créer un placeholder si nécessaire
    const placeholder = document.createElement('div');
    placeholder.className = 'w-full h-full bg-gray-100 flex items-center justify-center';
    placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
    
    img.parentNode?.insertBefore(placeholder, img);
  }
};
