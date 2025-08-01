import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string) => void;
  clearError: () => void;
  reset: () => void;
}

export function useLoadingState(initialState = false): LoadingState {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setErrorState] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setErrorState(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setErrorState(errorMessage);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset,
  };
}

// Specialized loading states for different features
export function useDataLoading() {
  return useLoadingState(true);
}

export function useActionLoading() {
  return useLoadingState(false);
}

export function useAsyncOperation() {
  const loadingState = useLoadingState(false);

  const executeAsync = useCallback(
    async (operation: () => Promise<void>) => {
      loadingState.startLoading();
      try {
        await operation();
      } catch (error) {
        loadingState.setError(
          error instanceof Error ? error.message : "An error occurred",
        );
      } finally {
        loadingState.stopLoading();
      }
    },
    [loadingState],
  );

  return {
    ...loadingState,
    executeAsync,
  };
}
