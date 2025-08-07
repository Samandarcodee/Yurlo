import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./global.css";
import "./utils/debug"; // Debug utilities for development
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nProvider } from "./contexts/I18nContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

// Main Error Fallback
const MainErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-2xl font-bold text-foreground">Ilova yuklanmadi</h1>
        <p className="text-muted-foreground">
          Ilovani ishga tushirishda muammo yuz berdi. Iltimos, sahifani yangilang.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Qayta urinish
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 ml-2"
          >
            Sahifani yangilash
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Xatolik ma'lumotlari (faqat rivojlanish uchun)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </I18nProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}