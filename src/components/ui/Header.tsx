import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showLogo = true, 
  className = "" 
}) => {
  return (
    <div className={`bg-white shadow-lg border-b-4 border-blue-500 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showLogo && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* Logo SVG */}
                  <img 
                    src="/logo-centre-diagnostic-official.svg" 
                    alt="Centre Diagnostic Logo" 
                    className="h-12 w-auto max-w-[200px]"
                    onError={(e) => {
                      console.error('Erreur de chargement du logo local, utilisation du logo Cloudinary:', e);
                      e.currentTarget.src = "https://res.cloudinary.com/dd64mwkl2/image/upload/v1734533177/Centre_Diagnostic-Logo_cyekdg.svg";
                    }}
                  />
                  {/* Fallback text logo */}
                  <div className="hidden logo-fallback">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Centre Diagnostic</span>
                    </div>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
              </div>
            )}
            <div>
              {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
