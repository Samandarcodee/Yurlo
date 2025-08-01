import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Brain, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/use-telegram";
import { useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { hapticFeedback, colorScheme, platform } = useTelegram();

  const navItems = [
    { path: "/", icon: Home, label: "Bosh sahifa" },
    { path: "/add-meal", icon: Camera, label: "Ovqat qo'shish" },
    { path: "/assistant", icon: Brain, label: "AI Yordamchi" },
    { path: "/analytics", icon: BarChart3, label: "Tahlil" },
    { path: "/profile", icon: Settings, label: "Profil" },
  ];

  // Telegram WebApp theme'ga moslashish
  useEffect(() => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorScheme]);

  const handleNavClick = () => {
    // Telegram'da haptic feedback
    hapticFeedback.selection();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Enhanced Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-white text-lg font-bold">
                  Y
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Yurlo AI</h1>
              <p className="text-xs text-muted-foreground">Sog'liq Yordamchingiz</p>
            </div>
          </div>

          {/* Enhanced Theme Toggle Button */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Responsive Design */}
      <main
        className="flex-1 pb-20 sm:pb-24"
        style={{
          paddingBottom: platform === "ios" ? "90px" : "80px", // iOS uchun qo'shimcha bo'sh joy
        }}
      >
        <div className="max-w-md mx-auto px-4 sm:px-6">{children}</div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border/30 backdrop-blur-xl shadow-2xl z-40">
        <div
          className="flex items-center justify-around px-2 py-2 max-w-md mx-auto"
          style={{
            paddingBottom: platform === "ios" ? "24px" : "16px", // iOS safe area uchun
          }}
        >
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all duration-300 min-w-[64px]",
                  isActive
                    ? "bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-lg transform scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:scale-105",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                )}
                
                <div className={cn(
                  "relative transition-all duration-300",
                  isActive && "transform scale-110"
                )}>
                  <Icon
                    size={22}
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "drop-shadow-sm" : "",
                    )}
                  />
                  
                  {/* Notification badge for specific pages */}
                  {path === "/assistant" && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-300 leading-tight",
                    isActive ? "opacity-100 font-semibold" : "opacity-80",
                  )}
                >
                  {label}
                </span>
                
                {/* Ripple effect on tap */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-white/10 animate-ping"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
