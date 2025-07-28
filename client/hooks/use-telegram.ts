import { useEffect, useState } from "react";
import { TelegramWebApp, TelegramUser } from "../types/telegram";

export interface TelegramWebAppHook {
  WebApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isLoading: boolean;
  platform: string;
  colorScheme: "light" | "dark";
  expand: () => void;
  close: () => void;
  ready: () => void;
  showMainButton: (text: string, callback: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (callback: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: {
    impact: (style?: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notification: (type: "error" | "success" | "warning") => void;
    selection: () => void;
  };
}

export const useTelegram = (): TelegramWebAppHook => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [WebApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    // Telegram WebApp SDK yuklanganini tekshiramiz
    const checkTelegramWebApp = () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        setIsReady(true);
        setIsLoading(false);

        // WebApp ni tayyorligini bildirish
        tg.ready();

        // WebApp ni kengaytirish
        tg.expand();

        return true;
      }
      return false;
    };

    // Darhol tekshiramiz
    if (checkTelegramWebApp()) {
      return;
    }

    // Agar Telegram WebApp SDK hali yuklanmagan bo'lsa, kutamiz
    const interval = setInterval(() => {
      if (checkTelegramWebApp()) {
        clearInterval(interval);
      }
    }, 100);

    // 5 soniyadan keyin to'xtatamiz
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
      console.warn("Telegram WebApp SDK yuklanmadi");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const user = WebApp?.initDataUnsafe?.user || null;
  const platform = WebApp?.platform || "unknown";
  const colorScheme = WebApp?.colorScheme || "light";

  const expand = () => {
    WebApp?.expand();
  };

  const close = () => {
    WebApp?.close();
  };

  const ready = () => {
    WebApp?.ready();
  };

  const showMainButton = (text: string, callback: () => void) => {
    if (WebApp?.MainButton) {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(callback);
      WebApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    WebApp?.MainButton?.hide();
  };

  const showBackButton = (callback: () => void) => {
    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(callback);
      WebApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    WebApp?.BackButton?.hide();
  };

  const hapticFeedback = {
    impact: (
      style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium",
    ) => {
      WebApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: "error" | "success" | "warning") => {
      WebApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      WebApp?.HapticFeedback?.selectionChanged();
    },
  };

  return {
    WebApp,
    user,
    isReady,
    isLoading,
    platform,
    colorScheme,
    expand,
    close,
    ready,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
  };
};
