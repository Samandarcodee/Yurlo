import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Brain, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Bosh sahifa" },
    { path: "/add-meal", icon: Camera, label: "Ovqat qo'shish" },
    { path: "/assistant", icon: Brain, label: "AI Yordamchi" },
    { path: "/analytics", icon: BarChart3, label: "Tahlil" },
    { path: "/settings", icon: Settings, label: "Sozlamalar" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 border-t border-mint-200/50 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 transform",
                  isActive
                    ? "bg-gradient-to-r from-mint-500 to-mint-600 text-white shadow-lg scale-110"
                    : "text-mint-600 hover:text-mint-800 hover:bg-mint-100/70 hover:scale-105"
                )}
              >
                <Icon size={20} className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-white"
                )}>
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
