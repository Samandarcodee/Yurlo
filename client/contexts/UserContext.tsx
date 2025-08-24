import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTelegram } from "../hooks/use-telegram";
import {
  logEnvironmentInfo,
} from "../utils/environment";
import { unifiedDataService } from "../services/unified-data-service";
import { useI18n } from "./I18nContext";
import { clearAllStoredData, resetUserData } from "../utils/storage";

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
  resetUserData: () => void; // New function
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
  const [hasInitialized, setHasInitialized] = useState(false);

  // Telegram WebApp hook
  const { user: telegramUser, isReady: isTelegramReady } = useTelegram();
  // i18n context
  const { setLanguage } = useI18n();

  // Optimized data loading - only once on startup
  useEffect(() => {
    if (hasInitialized) return; // Prevent multiple initializations

    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Environment info log qilish
        logEnvironmentInfo();

        // Telegram foydalanuvchi ID'sini olish
        const telegramId = telegramUser?.id?.toString() || "demo_user_123";
        console.log("Telegram user ID:", telegramId);

        // Database'dan foydalanuvchi ma'lumotlarini olish
        const dbProfile = await unifiedDataService.getUserProfile(telegramId);
        
        if (dbProfile) {
          // Database'dan kelgan ma'lumotlarni formatlash
          const profileData: UserProfile = {
            telegramId: dbProfile.telegram_id,
            name: dbProfile.name,
            gender: dbProfile.gender,
            birthYear: dbProfile.birth_year,
            age: dbProfile.age,
            height: dbProfile.height,
            weight: dbProfile.weight,
            activityLevel: dbProfile.activity_level,
            goal: dbProfile.goal,
            sleepTime: dbProfile.sleep_time,
            wakeTime: dbProfile.wake_time,
            language: dbProfile.language,
            bmr: dbProfile.bmr,
            dailyCalories: dbProfile.daily_calories,
            isFirstTime: dbProfile.is_first_time,
            createdAt: dbProfile.created_at || new Date().toISOString(),
            updatedAt: dbProfile.updated_at,
          };

          // Telegram user ma'lumotlarini yangilash
          if (telegramUser) {
            profileData.name = profileData.name || telegramUser.first_name;
            if (telegramUser.language_code && !profileData.language) {
              profileData.language =
                telegramUser.language_code === "uz"
                  ? "uz"
                  : telegramUser.language_code === "ru"
                    ? "ru"
                    : "en";
            }
          }

          setUser(profileData);
          setIsFirstTime(profileData.isFirstTime);
          // Sync global language with profile
          if (profileData.language) {
            setLanguage(profileData.language as any);
          }
          console.log("User loaded from database successfully. isFirstTime:", profileData.isFirstTime);
        } else {
          // Database'da yo'q bo'lsa localStorage'dan olish (fallback)
          const storageKey = `userProfile_${telegramId}`;
          const savedProfile = localStorage.getItem(storageKey);
          
          if (savedProfile) {
            try {
              const profileData = JSON.parse(savedProfile);
              if (profileData && profileData.name && profileData.age) {
                setUser(profileData);
                setIsFirstTime(profileData.isFirstTime);
                if (profileData.language) {
                  setLanguage(profileData.language as any);
                }
                console.log("User loaded from localStorage (fallback). isFirstTime:", profileData.isFirstTime);
              } else {
                setIsFirstTime(true);
              }
            } catch (parseError) {
              console.error("localStorage parse error:", parseError);
              setIsFirstTime(true);
            }
          } else {
            console.log("No saved profile found - yangi foydalanuvchi");
            setIsFirstTime(true);
          }
        }
      } catch (error) {
        console.error("Foydalanuvchi ma'lumotlarini yuklashda xatolik:", error);
        setIsFirstTime(true);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    // Telegram tayyor bo'lgandan keyin yuklash
    if (isTelegramReady) {
      loadUserProfile();
    } else if (!isTelegramReady && typeof window !== "undefined") {
      // Telegram mavjud bo'lmasa ham ishlashi uchun - timeout bilan
      const timeoutId = setTimeout(() => {
        console.log("Telegram WebApp timeout - loading without Telegram");
        loadUserProfile();
      }, 3000); // 3 soniya kutamiz

      return () => clearTimeout(timeoutId);
    }
  }, [telegramUser, isTelegramReady, hasInitialized]);

  // Fallback timeout - agar 10 soniyadan keyin hali loading bo'lsa
  useEffect(() => {
    if (isLoading && !hasInitialized) {
      const fallbackTimeout = setTimeout(() => {
        console.warn("UserContext loading timeout - forcing completion");
        setIsLoading(false);
        setHasInitialized(true);
        setIsFirstTime(true);
      }, 10000); // 10 soniya

      return () => clearTimeout(fallbackTimeout);
    }
  }, [isLoading, hasInitialized]);

  const updateUser = async (userData: UserProfile) => {
    console.log("Updating user data:", userData);

    // Telegram user ma'lumotlarini qo'shish
    if (telegramUser) {
      userData.telegramId = telegramUser.id.toString();
      userData.name = userData.name || telegramUser.first_name;
      if (telegramUser.language_code && !userData.language) {
        userData.language =
          telegramUser.language_code === "uz"
            ? "uz"
            : telegramUser.language_code === "ru"
              ? "ru"
              : "en";
      }
    }

    // Ma'lumotlar to'liq ekanligini aniqlash va isFirstTime ni to'g'ri belgilash
    userData.isFirstTime = false;
    userData.updatedAt = new Date().toISOString();

    setUser(userData);
    setIsFirstTime(false);
    // Ensure i18n provider follows saved profile language immediately
    if (userData.language) {
      setLanguage(userData.language as any);
    }

    // Database'ga saqlash
    const telegramId = telegramUser?.id?.toString() || "demo_user_123";
    
    try {
      // Database'ga saqlash uchun formatlash
      const dbProfile: Omit<DBUserProfile, 'id' | 'created_at' | 'updated_at'> = {
        telegram_id: userData.telegramId,
        name: userData.name,
        gender: userData.gender,
        birth_year: userData.birthYear,
        age: userData.age,
        height: userData.height,
        weight: userData.weight,
        activity_level: userData.activityLevel,
        goal: userData.goal,
        sleep_time: userData.sleepTime,
        wake_time: userData.wakeTime,
        language: userData.language,
        bmr: userData.bmr,
        daily_calories: userData.dailyCalories,
        is_first_time: userData.isFirstTime,
      };

      // Database'da mavjud bo'lsa yangilash, yo'q bo'lsa yaratish
      const existingProfile = await unifiedDataService.getUserProfile(telegramId);
      
      if (existingProfile) {
        await unifiedDataService.updateUserProfile(telegramId, dbProfile);
        console.log("User data updated in database successfully");
      } else {
        await unifiedDataService.createUserProfile(dbProfile);
        console.log("User data created in database successfully");
      }

      // localStorage'ga ham saqlash (fallback uchun)
      const storageKey = `userProfile_${telegramId}`;
      localStorage.setItem(storageKey, JSON.stringify(userData));
      console.log("User data saved to localStorage (backup) successfully");
      
    } catch (error) {
      console.error("Error saving user data:", error);
      
      // Database xatoligida localStorage'ga saqlash
      const storageKey = `userProfile_${telegramId}`;
      localStorage.setItem(storageKey, JSON.stringify(userData));
      console.log("User data saved to localStorage (fallback) due to database error");
    }
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
    // Static deployment uchun localStorage'dan qayta yuklash
    const telegramId = telegramUser?.id?.toString() || "demo_user_123";
    const storageKey = `userProfile_${telegramId}`;
    const savedProfile = localStorage.getItem(storageKey);

    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setUser(profileData);
        console.log("User refreshed from localStorage");
      } catch (error) {
        console.error("localStorage'dan refresh qilishda xatolik:", error);
      }
    }
  };

  const resetUserData = () => {
    clearAllStoredData();
    setUser(null);
    setIsFirstTime(true);
    console.log("All user data reset to default.");
  };

  const value: UserContextType = {
    user,
    isLoading,
    isFirstTime,
    updateUser,
    clearUser,
    refreshUser,
    resetUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook: foydalanuvchi birinchi marta kirganda welcome sahifasiga yo'naltirish
export const useOnboardingCheck = () => {
  const { user, isLoading, isFirstTime } = useUser();
  
  // Check if user has already visited welcome page
  const hasVisitedWelcome = localStorage.getItem('hasVisitedWelcome') === 'true';
  
  // Check if user explicitly started onboarding
  const hasStartedOnboarding = localStorage.getItem('hasStartedOnboarding') === 'true';

  return {
    shouldShowWelcome: !isLoading && isFirstTime && !user && !hasVisitedWelcome,
    shouldShowOnboarding: !isLoading && isFirstTime && !user && hasStartedOnboarding,
    isReady: !isLoading,
  };
};

// Mock AI tavsiyalar (backend mavjud bo'lmaganda)
const getMockRecommendations = () => ({
  dailyTips: [
    "🥗 Sabzavotlar bilan to'ldiring - kaloriya kam, to'yimlilik yuqori",
    "🚶 Kuniga 30 daqiqa yurish metabolizmni tezlashtiradi",
    "💧 Ovqatdan oldin bir stakan suv iching",
    "😴 7-8 soat uyqu sizning salomatingiz kaliti",
  ],
  nutritionAdvice: [
    "🍎 Har ovqatda meva yoki sabzavot qo'shing",
    "🍗 Oqsil: vazningizning har kg uchun 1.2g",
    "🌾 Kompleks uglevodlarni afzal ko'ring",
    "🥑 Foydali yog'lar (yong'oq, avokado, zeytun moyi)",
  ],
  exerciseAdvice: [
    "🚶 Kuniga 15 daqiqadan boshlab yurish",
    "🧘 Yoga yoki cho'zilish mashqlari",
    "🚶 Lift o'rniga zinapoyadan foydalaning",
    "🏃 Haftada 3-4 marta 30 daqiqa faollik",
  ],
  waterReminder: "Kuniga kamida 8 stakan (2 litr) suv iching",
  calorieAdjustment:
    "Maqsadingizga erishish uchun kuniga 1800-2200 kaloriya iste'mol qiling",
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
      // Static deployment uchun doim mock ma'lumotlarni ishlatish
      console.log("Static deployment: mock tavsiyalar yuklanmoqda...");

      // Kichik delay simulation qilish
      await new Promise((resolve) => setTimeout(resolve, 500));

      setRecommendations(getMockRecommendations());
    } catch (error) {
      console.error("Mock tavsiyalar yuklashda xatolik:", error);
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
