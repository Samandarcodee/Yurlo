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
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-mint-200 backdrop-blur-lg bg-mint-50/90">
        <div className="flex items-center justify-around px-2 py-2 text-mint-700">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon size={20} className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary-foreground"
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
