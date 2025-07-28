// Environment utilities for detecting if API is available

export const isApiAvailable = (): boolean => {
  // Development mode detection
  const isDev = import.meta.env.DEV || 
                import.meta.env.MODE === 'development' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.port === '8080';
  
  return isDev;
};

export const getApiUrl = (): string => {
  if (isApiAvailable()) {
    return '/api'; // Development URL
  }
  
  // Production'da API yo'q
  return '';
};

export const shouldUseLocalStorage = (): boolean => {
  return !isApiAvailable();
};

// Static deployment detection
export const isStaticDeployment = (): boolean => {
  return window.location.hostname.includes('vercel.app') ||
         window.location.hostname.includes('netlify.app') ||
         window.location.hostname.includes('github.io') ||
         !isApiAvailable();
};

export const logEnvironmentInfo = (): void => {
  console.log('🔧 Environment Info:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    hostname: window.location.hostname,
    port: window.location.port,
    isApiAvailable: isApiAvailable(),
    isStaticDeployment: isStaticDeployment(),
    shouldUseLocalStorage: shouldUseLocalStorage()
  });
};
