import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import {
  UserProvider,
  useOnboardingCheck,
  useUser,
} from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTelegram } from "./hooks/use-telegram";
import Index from "./pages/Index";
import FixedIndex from "./pages/FixedIndex";
import AddMeal from "./pages/AddMeal";
import Assistant from "./pages/Assistant";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import TelegramOnboarding from "./components/TelegramOnboarding";
import FixedOnboarding from "./components/FixedOnboarding";
import Profile from "./pages/Profile";
import EnhancedProfile from "./pages/EnhancedProfile";
import ComprehensiveProfile from "./pages/ComprehensiveProfile";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import EnhancedAddMeal from "./pages/EnhancedAddMeal";
import SuperiorAddMeal from "./pages/SuperiorAddMeal";
import DailyTracking from "./pages/DailyTracking";
import SleepTracker from "./pages/SleepTracker";
import StepTracker from "./pages/StepTracker";
import WaterTracker from "./pages/WaterTracker";
import WorkoutTracker from "./pages/WorkoutTracker";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Welcome from "./pages/Welcome";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">Xatolik yuz berdi</h1>
        <p className="text-muted-foreground">
          Ilovada muammo bor. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
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

const AppRoutes = () => {
  const { shouldShowWelcome, shouldShowOnboarding, isReady } = useOnboardingCheck();
  const { user } = useUser();
  const {
    isLoading: isTelegramLoading,
    isReady: isTelegramReady,
    platform,
  } = useTelegram();

  // Fallback state for loading timeout
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  console.log("Routing debug:", {
    shouldShowWelcome,
    shouldShowOnboarding,
    isReady,
    hasUser: !!user,
    isTelegramReady,
    platform,
    loadingTimeout,
  });

  // Loading timeout fallback
  React.useEffect(() => {
    if (!isReady || isTelegramLoading) {
      const timeout = setTimeout(() => {
        console.warn("App loading timeout - forcing continue");
        setLoadingTimeout(true);
      }, 8000); // 8 soniya

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isReady, isTelegramLoading]);

  // Optimized loading state
  if ((!isReady || isTelegramLoading) && !loadingTimeout) {
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
              <p className="text-muted-foreground text-sm">
                Platform: {platform}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show welcome page first for new users
  if (shouldShowWelcome) {
    console.log("Showing welcome page for new user");
    localStorage.setItem('hasVisitedWelcome', 'true');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Welcome />
      </div>
    );
  }

  // Show onboarding only after user clicked Start from welcome page
  if (shouldShowOnboarding) {
    console.log("Showing onboarding because user clicked Start");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <FixedOnboarding />
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FixedIndex />} />
        <Route path="/index-legacy" element={<Index />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<FixedOnboarding />} />
        <Route path="/onboarding-legacy" element={<Onboarding />} />
        <Route path="/telegram-onboarding" element={<TelegramOnboarding />} />
        <Route path="/profile" element={<ProfessionalProfile />} />
        <Route path="/profile-legacy" element={<Profile />} />
        <Route path="/profile-enhanced" element={<EnhancedProfile />} />
        <Route path="/profile-comprehensive" element={<ComprehensiveProfile />} />
        <Route path="/add-meal" element={<SuperiorAddMeal />} />
        <Route path="/add-meal-legacy" element={<AddMeal />} />
        <Route path="/add-meal-enhanced" element={<EnhancedAddMeal />} />
        <Route path="/daily-tracking" element={<DailyTracking />} />
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
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;