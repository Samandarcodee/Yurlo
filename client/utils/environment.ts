// Environment utilities for detecting if API is available

export const isApiAvailable = (): boolean => {
  // In development, API might not be available, so we'll use Supabase directly
  // In production, API is always available at /api/* endpoints
  return import.meta.env.PROD;
};

export const getApiUrl = (): string => {
  // In development, use localhost:8080/api
  // In production, use relative /api
  if (import.meta.env.DEV) {
    return "http://localhost:8080/api";
  }
  return "/api";
};

export const shouldUseLocalStorage = (): boolean => {
  // In development, we can use localStorage as fallback
  // In production, never use localStorage
  return import.meta.env.DEV;
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
