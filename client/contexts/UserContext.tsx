import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTelegram } from "../hooks/use-telegram";

export interface UserProfile {
  telegramId?: string;
  name: string;
  gender: string;
  birthYear: string;
  age: number;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  sleepTime?: string;
  wakeTime?: string;
  language: string;
  bmr: number;
  dailyCalories: number;
  isFirstTime: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isFirstTime: boolean;
  updateUser: (userData: UserProfile) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Telegram WebApp hook
  const { user: telegramUser, isReady: isTelegramReady } = useTelegram();

  // localStorage'dan foydalanuvchi ma'lumotlarini yuklash
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Telegram foydalanuvchi ID'sini olish
        const telegramId = telegramUser?.id?.toString() || "demo_user_123";
        console.log("Telegram user ID:", telegramId);

        // Avval localStorage'dan tekshiramiz
        const storageKey = `userProfile_${telegramId}`;
        const savedProfile = localStorage.getItem(storageKey);
        console.log("Saved profile from localStorage:", savedProfile);

        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            console.log("Parsed profile data:", profileData);

            // Ma'lumotlar to'g'ri formatda ekanligini tekshirish
            if (profileData && profileData.name && profileData.age) {
              // Telegram user ma'lumotlarini qo'shish/yangilash
              if (telegramUser) {
                profileData.telegramId = telegramId;
                profileData.name = profileData.name || telegramUser.first_name;
                if (telegramUser.language_code && !profileData.language) {
                  profileData.language = telegramUser.language_code === 'uz' ? 'uz' :
                                       telegramUser.language_code === 'ru' ? 'ru' : 'en';
                }
              }

              setUser(profileData);
              setIsFirstTime(false);
              console.log("User loaded from localStorage successfully");
            } else {
              console.log("Invalid profile data, clearing localStorage");
              localStorage.removeItem(storageKey);
              setIsFirstTime(true);
            }
          } catch (parseError) {
            console.error("localStorage parse error:", parseError);
            localStorage.removeItem(storageKey);
            setIsFirstTime(true);
          }
        } else {
          console.log("No saved profile found");
          // Backend'dan tekshiramiz
          try {
            const response = await fetch("/api/user/profile", {
              headers: {
                "x-telegram-id": telegramId,
              },
            });

            const result = await response.json();

            if (result.success && result.data) {
              // Telegram user ma'lumotlarini qo'shish
              if (telegramUser) {
                result.data.telegramId = telegramId;
                result.data.name = result.data.name || telegramUser.first_name;
                if (telegramUser.language_code && !result.data.language) {
                  result.data.language = telegramUser.language_code === 'uz' ? 'uz' :
                                       telegramUser.language_code === 'ru' ? 'ru' : 'en';
                }
              }

              setUser(result.data);
              localStorage.setItem(storageKey, JSON.stringify(result.data));
              setIsFirstTime(false);
            } else {
              setIsFirstTime(true);
            }
          } catch (error) {
            console.log("Backend mavjud emas, localStorage ishlatiladi");
            setIsFirstTime(true);
          }
        }
      } catch (error) {
        console.error("Foydalanuvchi ma'lumotlarini yuklashda xatolik:", error);
        setIsFirstTime(true);
      }
      setIsLoading(false);
    };

    // Telegram tayyor bo'lgandan keyin yuklash
    if (isTelegramReady) {
      loadUserProfile();
    } else if (!isTelegramReady && typeof window !== 'undefined') {
      // Telegram mavjud bo'lmasa ham ishlashi uchun
      setTimeout(loadUserProfile, 1000);
    }
  }, [telegramUser, isTelegramReady]);

  const updateUser = (userData: UserProfile) => {
    console.log("Updating user data:", userData);

    // Telegram user ma'lumotlarini qo'shish
    if (telegramUser) {
      userData.telegramId = telegramUser.id.toString();
      userData.name = userData.name || telegramUser.first_name;
      if (telegramUser.language_code && !userData.language) {
        userData.language = telegramUser.language_code === 'uz' ? 'uz' :
                           telegramUser.language_code === 'ru' ? 'ru' : 'en';
      }
    }

    setUser(userData);

    // Telegram ID asosida localStorage key yaratish
    const telegramId = telegramUser?.id?.toString() || "demo_user_123";
    const storageKey = `userProfile_${telegramId}`;
    localStorage.setItem(storageKey, JSON.stringify(userData));
    setIsFirstTime(false);
  };

  const clearUser = () => {
    setUser(null);

    // Telegram ID asosida localStorage key tozalash
    const telegramId = telegramUser?.id?.toString() || "demo_user_123";
    const storageKey = `userProfile_${telegramId}`;
    localStorage.removeItem(storageKey);
    setIsFirstTime(true);
  };

  const refreshUser = async () => {
    try {
      const telegramId = telegramUser?.id?.toString() || "demo_user_123";

      const response = await fetch("/api/user/profile", {
        headers: {
          "x-telegram-id": telegramId,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Telegram user ma'lumotlarini qo'shish
        if (telegramUser) {
          result.data.telegramId = telegramId;
          result.data.name = result.data.name || telegramUser.first_name;
          if (telegramUser.language_code && !result.data.language) {
            result.data.language = telegramUser.language_code === 'uz' ? 'uz' :
                                 telegramUser.language_code === 'ru' ? 'ru' : 'en';
          }
        }

        setUser(result.data);
        const storageKey = `userProfile_${telegramId}`;
        localStorage.setItem(storageKey, JSON.stringify(result.data));
      }
    } catch (error) {
      console.error("Foydalanuvchi ma'lumotlarini yangilashda xatolik:", error);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    isFirstTime,
    updateUser,
    clearUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook: foydalanuvchi birinchi marta kirganda onboarding'ga yo'naltirish
export const useOnboardingCheck = () => {
  const { user, isLoading, isFirstTime } = useUser();

  return {
    shouldShowOnboarding: !isLoading && (isFirstTime || !user),
    isReady: !isLoading,
  };
};

// Mock AI tavsiyalar (backend mavjud bo'lmaganda)
const getMockRecommendations = () => ({
  dailyTips: [
    '🥗 Sabzavotlar bilan to\'ldiring - kaloriya kam, to\'yimlilik yuqori',
    '🚶 Kuniga 30 daqiqa yurish metabolizmni tezlashtiradi',
    '💧 Ovqatdan oldin bir stakan suv iching',
    '😴 7-8 soat uyqu sizning salomatingiz kaliti'
  ],
  nutritionAdvice: [
    '🍎 Har ovqatda meva yoki sabzavot qo\'shing',
    '🍗 Oqsil: vazningizning har kg uchun 1.2g',
    '🌾 Kompleks uglevodlarni afzal ko\'ring',
    '🥑 Foydali yog\'lar (yong\'oq, avokado, zeytun moyi)'
  ],
  exerciseAdvice: [
    '🚶 Kuniga 15 daqiqadan boshlab yurish',
    '🧘 Yoga yoki cho\'zilish mashqlari',
    '🚶 Lift o\'rniga zinapoyadan foydalaning',
    '🏃 Haftada 3-4 marta 30 daqiqa faollik'
  ],
  waterReminder: 'Kuniga kamida 8 stakan (2 litr) suv iching',
  calorieAdjustment: 'Maqsadingizga erishish uchun kuniga 1800-2200 kaloriya iste\'mol qiling'
});

// Custom hook: AI tavsiyalar olish
export const useAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ilk marta yuklanganda mock tavsiyalarni ko'rsatish
  useEffect(() => {
    if (!recommendations) {
      // Kichik delay bilan mock ma'lumotlarni yuklash
      setTimeout(() => {
        setRecommendations(getMockRecommendations());
      }, 500);
    }
  }, [recommendations]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/recommendations", {
        headers: {
          "x-telegram-id": "demo_user_123", // Demo uchun
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data);
      } else {
        console.warn("AI tavsiyalar olishda server xatoligi:", result.message);
        // Fallback mock data
        setRecommendations(getMockRecommendations());
      }
    } catch (error) {
      console.error("AI tavsiyalar olishda xatolik:", error);
      // Backend mavjud bo'lmasa, mock ma'lumotlarni ishlatish
      setRecommendations(getMockRecommendations());
    }
    setLoading(false);
  };

  return {
    recommendations,
    loading,
    fetchRecommendations,
  };
};
