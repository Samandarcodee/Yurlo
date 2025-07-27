import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { UserProvider, useOnboardingCheck } from "./contexts/UserContext";
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

  console.log('Routing debug:', { shouldShowOnboarding, isReady, hasUser: !!user });

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-mint-100 rounded-full mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-mint-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-mint-600 font-medium">Yuklanmoqda...</p>
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
);

createRoot(document.getElementById("root")!).render(<App />);
