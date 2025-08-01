import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/use-telegram";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { hapticFeedback, colorScheme } = useTelegram();

  // Initialize theme based on Telegram WebApp or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (colorScheme === "dark" || savedTheme === "dark" || (systemPrefersDark && !savedTheme)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [colorScheme]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
    
    hapticFeedback.selection();
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-muted hover:bg-muted/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-foreground" />
      )}
    </button>
  );
} 