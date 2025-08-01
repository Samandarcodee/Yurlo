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
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string; }> }) => Promise<string | null>;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<boolean>;
  cloudStorage: {
    setItem: (key: string, value: string) => Promise<boolean>;
    getItem: (key: string) => Promise<string | null>;
    getItems: (keys: string[]) => Promise<{ [key: string]: string }>;
    removeItem: (key: string) => Promise<boolean>;
    removeItems: (keys: string[]) => Promise<boolean>;
    getKeys: () => Promise<string[]>;
  };
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

        // Telegram WebApp uchun CSS o'zgaruvchilarini o'rnatish
        if (tg.themeParams) {
          const themeParams = tg.themeParams;
          const root = document.documentElement;
          
          // Telegram tema ranglarini CSS o'zgaruvchilariga o'rnatish
          if (themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', themeParams.bg_color);
          }
          if (themeParams.text_color) {
            root.style.setProperty('--tg-text-color', themeParams.text_color);
          }
          if (themeParams.hint_color) {
            root.style.setProperty('--tg-hint-color', themeParams.hint_color);
          }
          if (themeParams.link_color) {
            root.style.setProperty('--tg-link-color', themeParams.link_color);
          }
          if (themeParams.button_color) {
            root.style.setProperty('--tg-button-color', themeParams.button_color);
          }
          if (themeParams.button_text_color) {
            root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
          }
        }

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

  // Enhanced Telegram methods with fallbacks
  const showAlert = (message: string) => {
    if (WebApp && 'showAlert' in WebApp && typeof WebApp.showAlert === 'function') {
      WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (WebApp && 'showConfirm' in WebApp && typeof WebApp.showConfirm === 'function') {
        (WebApp as any).showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  };

  const showPopup = (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string; }> }): Promise<string | null> => {
    return new Promise((resolve) => {
      if (WebApp && 'showPopup' in WebApp && typeof WebApp.showPopup === 'function') {
        (WebApp as any).showPopup(params, resolve);
      } else {
        alert(params.message);
        resolve(null);
      }
    });
  };

  const sendData = (data: string) => {
    if (WebApp && 'sendData' in WebApp && typeof WebApp.sendData === 'function') {
      (WebApp as any).sendData(data);
    }
  };

  const openLink = (url: string) => {
    if (WebApp && 'openLink' in WebApp && typeof WebApp.openLink === 'function') {
      (WebApp as any).openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const openTelegramLink = (url: string) => {
    if (WebApp && 'openTelegramLink' in WebApp && typeof WebApp.openTelegramLink === 'function') {
      (WebApp as any).openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const openInvoice = (url: string) => {
    if (WebApp && 'openInvoice' in WebApp && typeof WebApp.openInvoice === 'function') {
      (WebApp as any).openInvoice(url);
    }
  };

  const switchInlineQuery = (query: string, choose_chat_types?: string[]) => {
    if (WebApp && 'switchInlineQuery' in WebApp && typeof WebApp.switchInlineQuery === 'function') {
      (WebApp as any).switchInlineQuery(query, choose_chat_types);
    }
  };

  const requestWriteAccess = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (WebApp && 'requestWriteAccess' in WebApp && typeof WebApp.requestWriteAccess === 'function') {
        (WebApp as any).requestWriteAccess(resolve);
      } else {
        resolve(false);
      }
    });
  };

  const requestContact = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (WebApp && 'requestContact' in WebApp && typeof WebApp.requestContact === 'function') {
        (WebApp as any).requestContact(resolve);
      } else {
        resolve(false);
      }
    });
  };

  // Cloud Storage with localStorage fallback
  const cloudStorage = {
    setItem: (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'setItem' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.setItem(key, value, (error: any) => {
            resolve(!error);
          });
        } else {
          try {
            localStorage.setItem(`tg_cloud_${key}`, value);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },
    getItem: (key: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'getItem' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.getItem(key, (error: any, value: any) => {
            resolve(error ? null : (value || null));
          });
        } else {
          resolve(localStorage.getItem(`tg_cloud_${key}`));
        }
      });
    },
    getItems: (keys: string[]): Promise<{ [key: string]: string }> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'getItems' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.getItems(keys, (error: any, values: any) => {
            resolve(error ? {} : (values || {}));
          });
        } else {
          const result: { [key: string]: string } = {};
          keys.forEach(key => {
            const value = localStorage.getItem(`tg_cloud_${key}`);
            if (value) result[key] = value;
          });
          resolve(result);
        }
      });
    },
    removeItem: (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'removeItem' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.removeItem(key, (error: any) => {
            resolve(!error);
          });
        } else {
          try {
            localStorage.removeItem(`tg_cloud_${key}`);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },
    removeItems: (keys: string[]): Promise<boolean> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'removeItems' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.removeItems(keys, (error: any) => {
            resolve(!error);
          });
        } else {
          try {
            keys.forEach(key => localStorage.removeItem(`tg_cloud_${key}`));
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },
    getKeys: (): Promise<string[]> => {
      return new Promise((resolve) => {
        if (WebApp && (WebApp as any).CloudStorage && 'getKeys' in (WebApp as any).CloudStorage) {
          (WebApp as any).CloudStorage.getKeys((error: any, keys: any) => {
            resolve(error ? [] : (keys || []));
          });
        } else {
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('tg_cloud_')) {
              keys.push(key.replace('tg_cloud_', ''));
            }
          }
          resolve(keys);
        }
      });
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
    showAlert,
    showConfirm,
    showPopup,
    sendData,
    openLink,
    openTelegramLink,
    openInvoice,
    switchInlineQuery,
    requestWriteAccess,
    requestContact,
    cloudStorage,
    hapticFeedback,
  };
};
