import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackClassName?: string;
  onError?: (error: Event) => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  fallbackClassName = 'bg-gray-100 flex items-center justify-center',
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Erreur de chargement de l\'image:', src, e);
    setHasError(true);
    setIsLoading(false);
    onError?.(e.nativeEvent);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Si pas d'URL ou erreur de chargement, afficher le fallback
  if (!src || hasError) {
    return (
      <div className={`${className} ${fallbackClassName}`}>
        {fallbackIcon || <FontAwesomeIcon icon={faUtensils} className="text-gray-400 text-2xl" />}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} ${fallbackClassName} animate-pulse`}>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};
