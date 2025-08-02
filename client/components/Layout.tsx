import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Brain, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/use-telegram";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { hapticFeedback, colorScheme, platform } = useTelegram();

  const navItems = [
    { path: "/", icon: Home, label: "Bosh sahifa" },
    { path: "/add-meal", icon: Camera, label: "Ovqat qo'shish" },
    { path: "/daily-tracking", icon: Brain, label: "Tracking" },
    { path: "/analytics", icon: BarChart3, label: "Tahlil" },
    { path: "/profile", icon: Settings, label: "Profil" },
  ];

  // Always use dark theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleNavClick = () => {
    // Telegram'da haptic feedback
    hapticFeedback.selection();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/30 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">Y</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Yurlo AI</h1>
              <p className="text-xs text-slate-300">Sog'liq Yordamchingiz</p>
            </div>
          </div>

          {/* Right side header actions can go here */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-hidden">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl z-40">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
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
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 shadow-lg transform scale-105"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-105",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
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
                  
                  {/* Notification badge */}
                  {path === "/daily-tracking" && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-300 leading-tight text-center",
                    isActive ? "text-green-400 font-semibold" : "text-slate-400",
                  )}
                >
                  {label}
                </span>
                
                {/* Ripple effect on tap */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-green-400/10 animate-ping"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}