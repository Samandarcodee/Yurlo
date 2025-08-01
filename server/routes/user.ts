import { RequestHandler } from "express";

interface UserProfile {
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

// In-memory storage (keyingi versiyalarda MongoDB bilan almashtiriladi)
const users: Map<string, UserProfile> = new Map();

// Create or update user profile
export const createOrUpdateProfile: RequestHandler = (req, res) => {
  try {
    const profileData: UserProfile = req.body;

    // Telegram ID'ni headerdan yoki req'dan olish (demo uchun random)
    const telegramId =
      req.headers["x-telegram-id"]?.toString() || "demo_user_123";

    // Yangi profil yaratish yoki mavjudini yangilash
    const existingProfile = users.get(telegramId);

    const updatedProfile: UserProfile = {
      ...profileData,
      telegramId,
      updatedAt: new Date().toISOString(),
      ...(existingProfile && { createdAt: existingProfile.createdAt }),
    };

    users.set(telegramId, updatedProfile);

    res.status(200).json({
      success: true,
      message: "Profil muvaffaqiyatli saqlandi",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Profil saqlashda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error instanceof Error ? error.message : "Noma'lum xatolik",
    });
  }
};

// Get user profile
export const getUserProfile: RequestHandler = (req, res) => {
  try {
    const telegramId =
      req.headers["x-telegram-id"]?.toString() || "demo_user_123";

    const profile = users.get(telegramId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profil topilmadi",
        isFirstTime: true,
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
      isFirstTime: false,
    });
  } catch (error) {
    console.error("Profil olishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error instanceof Error ? error.message : "Noma'lum xatolik",
    });
  }
};

// Update specific profile fields
export const updateProfileFields: RequestHandler = (req, res) => {
  try {
    const telegramId =
      req.headers["x-telegram-id"]?.toString() || "demo_user_123";
    const fieldsToUpdate = req.body;

    const existingProfile = users.get(telegramId);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profil topilmadi",
      });
    }

    // Faqat ruxsat etilgan maydonlarni yangilash
    const allowedFields = [
      "name",
      "weight",
      "height",
      "activityLevel",
      "goal",
      "sleepTime",
      "wakeTime",
      "language",
    ];

    const updatedData: Partial<UserProfile> = {};

    for (const field of allowedFields) {
      if (fieldsToUpdate[field] !== undefined) {
        (updatedData as any)[field] = fieldsToUpdate[field];
      }
    }

    // BMR va kunlik kaloriyani qayta hisoblash agar vazn, bo'y yoki faollik o'zgargan bo'lsa
    if (updatedData.weight || updatedData.height || updatedData.activityLevel) {
      const height = parseFloat(updatedData.height || existingProfile.height);
      const weight = parseFloat(updatedData.weight || existingProfile.weight);
      const age = existingProfile.age;
      const gender = existingProfile.gender;
      const activityLevel =
        updatedData.activityLevel || existingProfile.activityLevel;

      let bmr = 0;
      if (gender === "male") {
        bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
      }

      const activityMultiplier = {
        low: 1.2,
        medium: 1.55,
        high: 1.725,
      };

      const dailyCalories = Math.round(
        bmr *
          activityMultiplier[activityLevel as keyof typeof activityMultiplier],
      );

      updatedData.bmr = Math.round(bmr);
      updatedData.dailyCalories = dailyCalories;
    }

    const updatedProfile = {
      ...existingProfile,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    users.set(telegramId, updatedProfile);

    res.status(200).json({
      success: true,
      message: "Profil yangilandi",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Profil yangilashda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error instanceof Error ? error.message : "Noma'lum xatolik",
    });
  }
};

// Delete user profile
export const deleteProfile: RequestHandler = (req, res) => {
  try {
    const telegramId =
      req.headers["x-telegram-id"]?.toString() || "demo_user_123";

    const existed = users.delete(telegramId);

    if (!existed) {
      return res.status(404).json({
        success: false,
        message: "Profil topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profil o'chirildi",
    });
  } catch (error) {
    console.error("Profil o'chirishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error instanceof Error ? error.message : "Noma'lum xatolik",
    });
  }
};

// Get AI personalized recommendations
export const getAIRecommendations: RequestHandler = (req, res) => {
  try {
    const telegramId =
      req.headers["x-telegram-id"]?.toString() || "demo_user_123";
    const profile = users.get(telegramId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profil topilmadi",
      });
    }

    // AI tavsiyalarini profil asosida yaratish
    const recommendations = generatePersonalizedRecommendations(profile);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("AI tavsiyalar olishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Server xatoligi",
      error: error instanceof Error ? error.message : "Noma'lum xatolik",
    });
  }
};

// AI tavsiyalar yaratish funksiyasi
function generatePersonalizedRecommendations(profile: UserProfile) {
  const recommendations = {
    dailyTips: [] as string[],
    nutritionAdvice: [] as string[],
    exerciseAdvice: [] as string[],
    waterReminder: "",
    calorieAdjustment: "",
  };

  // Maqsadga qarab tavsiyalar
  switch (profile.goal) {
    case "lose":
      recommendations.dailyTips.push(
        "🥗 Sabzavotlar bilan to'ldiring - kaloriya kam, to'yimlilik yuqori",
        "🚶 Kuniga 30 daqiqa yurish metabolizmni tezlashtiradi",
        "💧 Ovqatdan oldin bir stakan suv iching",
      );
      recommendations.calorieAdjustment = `Vazn kamaytirish uchun kuniga ${profile.dailyCalories - 300} kaloriya iste'mol qiling`;
      break;
    case "gain":
      recommendations.dailyTips.push(
        "🥜 Quruq meyvalar va yong'oqlar qo'shing",
        "🏋️ Kuch mashqlari bilan mushak massasini oshiring",
        "🥛 Oqsilga boy mahsulotlarni iste'mol qiling",
      );
      recommendations.calorieAdjustment = `Vazn ko'paytirish uchun kuniga ${profile.dailyCalories + 300} kaloriya iste'mol qiling`;
      break;
    default:
      recommendations.dailyTips.push(
        "⚖️ Muvozanatli ovqatlanishni davom eting",
        "🏃 Muntazam jismoniy faollik bilan sog'lig'ingizni saqlang",
        "😴 To'liq uyqu sizning salomatingiz kaliti",
      );
      recommendations.calorieAdjustment = `Vaznni saqlash uchun kuniga ${profile.dailyCalories} kaloriya iste'mol qiling`;
  }

  // Faollik darajasiga qarab
  switch (profile.activityLevel) {
    case "low":
      recommendations.exerciseAdvice.push(
        "🚶 Kuniga 15 daqiqadan boshlab yurish",
        "🧘 Yoga yoki cho'zilish mashqlari",
        "🚶 Lift o'rniga zinapoyadan foydalaning",
      );
      break;
    case "medium":
      recommendations.exerciseAdvice.push(
        "🏃 Haftada 3-4 marta 30 daqiqa yugurish",
        "🏋️ Haftada 2 marta kuch mashqlari",
        "🚴 Velosiped yoki suzish",
      );
      break;
    case "high":
      recommendations.exerciseAdvice.push(
        "💪 Intensiv mashqlar va kuch tayyorgarligi",
        "🏃 HIIT mashqlari samaradorlik uchun",
        "🤸 Sport turlarini almashtirib turing",
      );
  }

  // Suv tavsiyasi
  const waterNeeds = Math.round(parseFloat(profile.weight) * 35); // ml/kg
  recommendations.waterReminder = `Kuniga kamida ${Math.round(waterNeeds / 250)} stakan (${waterNeeds}ml) suv iching`;

  // Ovqatlanish tavsiyalari
  recommendations.nutritionAdvice.push(
    "🍎 Har ovqatda meva yoki sabzavot qo'shing",
    "🍗 Oqsil: vazningizning har kg uchun 1.2g",
    "🌾 Kompleks uglevodlarni afzal ko'ring",
    "🥑 Foydali yog'lar (yong'oq, avokado, zeytun moyi)",
  );

  return recommendations;
}
