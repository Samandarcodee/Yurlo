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
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTelegram } from "./hooks/use-telegram";
import Index from "./pages/Index";
import AddMeal from "./pages/AddMeal";
import Assistant from "./pages/Assistant";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import SleepTracker from "./pages/SleepTracker";
import StepTracker from "./pages/StepTracker";
import WaterTracker from "./pages/WaterTracker";
import WorkoutTracker from "./pages/WorkoutTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v5)
      retry: 1,
    },
  },
});

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

  // Optimized loading state
  if (!isReady || isTelegramLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/60 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">
              {isTelegramLoading
                ? "Telegram WebApp yuklanmoqda..."
                : "Yuklanmoqda..."}
            </p>
            {isTelegramReady && (
              <p className="text-muted-foreground text-sm">Platform: {platform}</p>
            )}
          </div>
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
        <Route path="/sleep-tracker" element={<SleepTracker />} />
        <Route path="/step-tracker" element={<StepTracker />} />
        <Route path="/water-tracker" element={<WaterTracker />} />
        <Route path="/workout-tracker" element={<WorkoutTracker />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </UserProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
