// Environment utilities for detecting if API is available

export const isApiAvailable = (): boolean => {
  // Always assume API is available in production with Vercel
  // The API will be available at /api/* endpoints
  return true;
};

export const getApiUrl = (): string => {
  // API is always available at /api relative to the current domain
  return "/api";
};

export const shouldUseLocalStorage = (): boolean => {
  // Only use localStorage as fallback, not as primary storage
  return false;
};

// Static deployment detection
export const isStaticDeployment = (): boolean => {
  return (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("netlify.app") ||
    window.location.hostname.includes("github.io")
  );
};

export const logEnvironmentInfo = (): void => {
  console.log("🔧 Environment Info:", {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    hostname: window.location.hostname,
    port: window.location.port,
    isApiAvailable: isApiAvailable(),
    isStaticDeployment: isStaticDeployment(),
    shouldUseLocalStorage: shouldUseLocalStorage(),
    apiUrl: getApiUrl(),
  });
};
