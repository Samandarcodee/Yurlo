import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTelegram } from "@/hooks/use-telegram";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  variant?: "compact" | "expanded";
}

export function ThemeToggle({ className, variant = "compact" }: ThemeToggleProps) {
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

    hapticFeedback.impact("light");
  };

  const getThemeData = () => {
    if (theme === "system") {
      return {
        icon: Monitor,
        label: "System",
        description: "Qurilma sozlamasi",
        gradient: "from-slate-500 to-gray-500",
        bgGradient: "from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900"
      };
    }
    if (effectiveTheme === "dark") {
      return {
        icon: Sun,
        label: "Light",
        description: "Yorug' rejim",
        gradient: "from-yellow-400 to-orange-500",
        bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
      };
    }
    return {
      icon: Moon,
      label: "Dark",
      description: "Tungi rejim",
      gradient: "from-blue-600 to-purple-600",
      bgGradient: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
    };
  };

  const themeData = getThemeData();
  const Icon = themeData.icon;

  const getAriaLabel = () => {
    if (theme === "light") return "Tungi rejimga o'tish";
    if (theme === "dark") return "System rejimiga o'tish";
    return "Yorug' rejimga o'tish";
  };

  if (variant === "expanded") {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${themeData.bgGradient} border border-border/30 p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        aria-label={getAriaLabel()}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <div className="flex items-center space-x-3">
          <div className={`relative p-2 rounded-xl bg-gradient-to-br ${themeData.gradient} shadow-lg`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{themeData.label}</p>
            <p className="text-xs text-muted-foreground">{themeData.description}</p>
          </div>
        </div>
        
        {/* Theme indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeData.gradient} animate-pulse`}></div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`group relative p-3 rounded-2xl bg-gradient-to-br ${themeData.bgGradient} border border-border/30 transition-all duration-300 hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-label={getAriaLabel()}
      title={`Hozirgi: ${themeData.label} rejim`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`p-1 rounded-lg bg-gradient-to-br ${themeData.gradient} shadow-md`}
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>
        </AnimatePresence>
        
        {/* Active theme indicator */}
        <div className="absolute -top-1 -right-1">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeData.gradient} border border-background animate-pulse`}></div>
        </div>
      </div>
    </motion.button>
  );
}
