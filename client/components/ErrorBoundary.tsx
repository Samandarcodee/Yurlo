import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  FallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Network errors uchun maxsus handling
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("fetch")
    ) {
      console.log(
        "🌐 Network/API xatoligi aniqlandi - static mode ishlatilmoqda",
      );
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom FallbackComponent
      if (this.props.FallbackComponent) {
        return <this.props.FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
      }

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-gray-600 mb-4">
              Ilovada texnik muammo yuz berdi. Sahifani yangilang yoki qayta
              urinib ko'ring.
            </p>
            <div className="space-y-2">
              <button
                onClick={this.resetErrorBoundary}
                className="px-6 py-3 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors"
              >
                🔄 Qayta urinish
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-2"
              >
                📄 Sahifani yangilash
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error) => {
    console.error("Error handled:", error);

    if (error.message.includes("Failed to fetch")) {
      console.log("🌐 Fetch xatoligi - static mode");
      return;
    }

    // Other error handling
    throw error;
  };

  return { handleError };
};

// Default export
export default ErrorBoundary;
