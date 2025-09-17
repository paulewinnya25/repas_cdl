import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPalette } from '@fortawesome/free-solid-svg-icons';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - utilise la préférence système
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'dark': return faMoon;
      case 'light': return faSun;
      case 'auto': return faPalette;
      default: return faSun;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark': return 'Sombre';
      case 'light': return 'Clair';
      case 'auto': return 'Auto';
      default: return 'Clair';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
          const currentIndex = themes.indexOf(theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          handleThemeChange(themes[nextIndex]);
        }}
        className="flex items-center space-x-2"
      >
        <FontAwesomeIcon icon={getIcon()} />
        <span className="hidden sm:inline">{getLabel()}</span>
      </Button>
    </div>
  );
};









