import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('caloria-theme') as Theme;
      return saved || 'system';
    }
    return 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      setActualTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setActualTheme(theme);
    }

    // Save to localStorage
    localStorage.setItem('caloria-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        const systemTheme = e.matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setActualTheme(systemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Telegram Mini App theme detection
  useEffect(() => {
    try {
      // @ts-ignore - Telegram WebApp API
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Get Telegram theme
        const telegramTheme = tg.colorScheme || 'light';
        
        // If user hasn't set a preference, use Telegram theme
        const savedTheme = localStorage.getItem('caloria-theme');
        if (!savedTheme) {
          setTheme(telegramTheme as Theme);
        }

        // Listen for Telegram theme changes
        tg.onEvent('themeChanged', () => {
          if (theme === 'system' || !localStorage.getItem('caloria-theme')) {
            setTheme(tg.colorScheme as Theme);
          }
        });
      }
    } catch (error) {
      console.log('Telegram WebApp not available, using default theme detection');
    }
  }, []);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Theme toggle button component
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, actualTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return '🌓'; // Auto
    }
    return actualTheme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'Auto';
    }
    return actualTheme === 'dark' ? 'Tungi' : 'Kunduzgi';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-background/50 backdrop-blur-sm border border-border/50
        hover:bg-accent/10 active:scale-95
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        text-sm font-medium
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <span className="text-lg transition-transform duration-300 hover:scale-110">
        {getIcon()}
      </span>
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}

// Theme status indicator
export function ThemeIndicator() {
  const { actualTheme, theme } = useTheme();
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${
        actualTheme === 'dark' 
          ? 'bg-blue-500' 
          : 'bg-yellow-500'
      }`} />
      <span>
        {actualTheme === 'dark' ? 'Tungi' : 'Kunduzgi'} rejim
        {theme === 'system' && ' (Auto)'}
      </span>
    </div>
  );
}