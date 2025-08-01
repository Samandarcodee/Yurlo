import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTelegram } from "@/hooks/use-telegram";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { hapticFeedback } = useTelegram();

  const toggleTheme = () => {
    // Cycle through themes: light -> dark -> system
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }

    hapticFeedback.selection();
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="w-4 h-4 text-foreground" />;
    }
    return effectiveTheme === "dark" ? (
      <Sun className="w-4 h-4 text-foreground" />
    ) : (
      <Moon className="w-4 h-4 text-foreground" />
    );
  };

  const getAriaLabel = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to system mode";
    return "Switch to light mode";
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-muted hover:bg-muted/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-label={getAriaLabel()}
      title={`Current: ${theme} mode`}
    >
      {getIcon()}
    </button>
  );
}
