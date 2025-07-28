import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

  // localStorage'dan foydalanuvchi ma'lumotlarini yuklash
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Avval localStorage'dan tekshiramiz
        const savedProfile = localStorage.getItem("userProfile");
        console.log("Saved profile from localStorage:", savedProfile);

        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            console.log("Parsed profile data:", profileData);

            // Ma'lumotlar to'g'ri formatda ekanligini tekshirish
            if (profileData && profileData.name && profileData.age) {
              setUser(profileData);
              setIsFirstTime(false);
              console.log("User loaded from localStorage successfully");
            } else {
              console.log("Invalid profile data, clearing localStorage");
              localStorage.removeItem("userProfile");
              setIsFirstTime(true);
            }
          } catch (parseError) {
            console.error("localStorage parse error:", parseError);
            localStorage.removeItem("userProfile");
            setIsFirstTime(true);
          }
        } else {
          console.log("No saved profile found");
          // Backend'dan tekshiramiz
          try {
            const response = await fetch("/api/user/profile", {
              headers: {
                "x-telegram-id": "demo_user_123", // Demo uchun
              },
            });

            const result = await response.json();

            if (result.success && result.data) {
              setUser(result.data);
              localStorage.setItem("userProfile", JSON.stringify(result.data));
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

    loadUserProfile();
  }, []);

  const updateUser = (userData: UserProfile) => {
    console.log("Updating user data:", userData);
    setUser(userData);
    localStorage.setItem("userProfile", JSON.stringify(userData));
    setIsFirstTime(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("userProfile");
    setIsFirstTime(true);
  };

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          "x-telegram-id": "demo_user_123", // Demo uchun
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setUser(result.data);
        localStorage.setItem("userProfile", JSON.stringify(result.data));
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
