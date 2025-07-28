import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  UserProvider,
  useOnboardingCheck,
  useUser,
} from "./contexts/UserContext";
import { useTelegram } from "./hooks/use-telegram";
import Index from "./pages/Index";
import AddMeal from "./pages/AddMeal";
import Assistant from "./pages/Assistant";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { shouldShowOnboarding, isReady } = useOnboardingCheck();
  const { user } = useUser();
  const {
    isLoading: isTelegramLoading,
    isReady: isTelegramReady,
    platform,
  } = useTelegram();

  console.log("Routing debug:", {
    shouldShowOnboarding,
    isReady,
    hasUser: !!user,
    isTelegramReady,
    platform,
  });

  // Telegram WebApp va User context ikkalasi ham yuklanishini kutamiz
  if (!isReady || isTelegramLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-mint-100 rounded-full mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-mint-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-mint-600 font-medium">
            {isTelegramLoading
              ? "Telegram WebApp yuklanmoqda..."
              : "Yuklanmoqda..."}
          </p>
          {isTelegramReady && (
            <p className="text-mint-500 text-sm mt-2">Platform: {platform}</p>
          )}
        </div>
      </div>
    );
  }

  // Agar foydalanuvchi birinchi marta kirsa, onboarding'ga yo'naltirish
  if (shouldShowOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
