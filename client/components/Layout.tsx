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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                Y
              </span>
            </div>
            <span className="font-semibold text-foreground">Yurlo AI</span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />
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
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 border-t border-border/50 backdrop-blur-xl shadow-2xl z-40">
        <div
          className="flex items-center justify-around px-4 py-3 max-w-md mx-auto"
          style={{
            paddingBottom: platform === "ios" ? "20px" : "12px", // iOS safe area uchun
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
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "transition-all duration-300",
                    isActive && "scale-125",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium tracking-wide",
                    isActive && "text-primary-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
