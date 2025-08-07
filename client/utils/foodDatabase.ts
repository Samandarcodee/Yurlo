import { Meal } from "./tracking";

// Food item interface
export interface FoodItem {
  id: string;
  name: string;
  nameUz: string;
  brand?: string;
  category: string;
  barcode?: string;
  serving: {
    size: string;
    unit: string;
    grams: number;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  tags: string[];
  isVerified: boolean;
  popularity: number; // 0-100
}

// Food categories
export const FOOD_CATEGORIES = {
  fruits: { id: "fruits", name: "Mevalar", icon: "🍎" },
  vegetables: { id: "vegetables", name: "Sabzavotlar", icon: "🥕" },
  grains: { id: "grains", name: "Donlar", icon: "🌾" },
  protein: { id: "protein", name: "Oqsilli ovqatlar", icon: "🍗" },
  dairy: { id: "dairy", name: "Sut mahsulotlari", icon: "🥛" },
  nuts: { id: "nuts", name: "Yong'oqlar", icon: "🥜" },
  beverages: { id: "beverages", name: "Ichimliklar", icon: "🥤" },
  snacks: { id: "snacks", name: "Gazellar", icon: "🍿" },
  sweets: { id: "sweets", name: "Shirinliklar", icon: "🍰" },
  fast_food: { id: "fast_food", name: "Fast Food", icon: "🍔" },
  traditional: { id: "traditional", name: "Milliy taomlar", icon: "🍲" },
  bread: { id: "bread", name: "Non mahsulotlari", icon: "🍞" },
} as const;

// Uzbek food database
export const UZBEK_FOODS: FoodItem[] = [
  // Traditional Uzbek dishes
  {
    id: "osh",
    name: "Pilaf",
    nameUz: "Osh",
    category: "traditional",
    serving: { size: "1 porsiya", unit: "porsiya", grams: 250 },
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 65,
      fat: 12,
      fiber: 3,
      sugar: 2,
      sodium: 850,
    },
    tags: ["milliy", "asosiy ovqat", "guruch", "go'sht"],
    isVerified: true,
    popularity: 95,
  },
  {
    id: "lagmon",
    name: "Lagman",
    nameUz: "Lag'mon",
    category: "traditional",
    serving: { size: "1 porsiya", unit: "porsiya", grams: 300 },
    nutrition: {
      calories: 380,
      protein: 22,
      carbs: 45,
      fat: 14,
      fiber: 4,
      sugar: 6,
      sodium: 920,
    },
    tags: ["milliy", "sho'rva", "makaron", "sabzavot"],
    isVerified: true,
    popularity: 88,
  },
  {
    id: "manti",
    name: "Manti",
    nameUz: "Manti",
    category: "traditional",
    serving: { size: "4 dona", unit: "dona", grams: 200 },
    nutrition: {
      calories: 320,
      protein: 16,
      carbs: 35,
      fat: 15,
      fiber: 2,
      sugar: 3,
      sodium: 650,
    },
    tags: ["milliy", "bug'da", "go'sht", "xamir"],
    isVerified: true,
    popularity: 92,
  },
  {
    id: "somsa",
    name: "Samsa",
    nameUz: "Somsa",
    category: "traditional",
    serving: { size: "1 dona", unit: "dona", grams: 120 },
    nutrition: {
      calories: 280,
      protein: 12,
      carbs: 25,
      fat: 16,
      fiber: 2,
      sugar: 2,
      sodium: 480,
    },
    tags: ["milliy", "tandur", "xamir", "go'sht"],
    isVerified: true,
    popularity: 85,
  },
  {
    id: "shurpa",
    name: "Shurpa",
    nameUz: "Sho'rva",
    category: "traditional",
    serving: { size: "1 porsiya", unit: "porsiya", grams: 280 },
    nutrition: {
      calories: 220,
      protein: 18,
      carbs: 12,
      fat: 12,
      fiber: 3,
      sugar: 4,
      sodium: 780,
    },
    tags: ["milliy", "sho'rva", "go'sht", "sabzavot"],
    isVerified: true,
    popularity: 78,
  },

  // Bread and grain products
  {
    id: "non",
    name: "Uzbek Bread",
    nameUz: "Non",
    category: "bread",
    serving: { size: "1 bo'lak", unit: "bo'lak", grams: 80 },
    nutrition: {
      calories: 180,
      protein: 6,
      carbs: 35,
      fat: 2,
      fiber: 3,
      sugar: 1,
      sodium: 320,
    },
    tags: ["non", "asosiy", "xamir"],
    isVerified: true,
    popularity: 98,
  },
  {
    id: "salat",
    name: "Fresh Salad",
    nameUz: "Salat",
    category: "vegetables",
    serving: { size: "1 kosa", unit: "kosa", grams: 180 },
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 14,
      fat: 5,
      fiber: 5,
      sugar: 6,
      sodium: 210,
    },
    tags: ["salat", "sabzavot", "yengil", "diet"]
    ,
    isVerified: true,
    popularity: 76,
  },
  {
    id: "guruch",
    name: "Rice",
    nameUz: "Guruch",
    category: "grains",
    serving: { size: "1/2 stakan", unit: "stakan", grams: 100 },
    nutrition: {
      calories: 130,
      protein: 3,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodium: 5,
    },
    tags: ["guruch", "asosiy", "don"],
    isVerified: true,
    popularity: 90,
  },

  // Vegetables
  {
    id: "sabzi",
    name: "Carrot",
    nameUz: "Sabzi",
    category: "vegetables",
    serving: { size: "1 dona", unit: "dona", grams: 120 },
    nutrition: {
      calories: 50,
      protein: 1,
      carbs: 12,
      fat: 0.2,
      fiber: 3.6,
      sugar: 6,
      sodium: 69,
    },
    tags: ["sabzavot", "vitamin", "xom"],
    isVerified: true,
    popularity: 75,
  },
  {
    id: "piyoz",
    name: "Onion",
    nameUz: "Piyoz",
    category: "vegetables",
    serving: { size: "1 dona", unit: "dona", grams: 150 },
    nutrition: {
      calories: 60,
      protein: 1.7,
      carbs: 14,
      fat: 0.2,
      fiber: 2.7,
      sugar: 6.8,
      sodium: 6,
    },
    tags: ["sabzavot", "ziravorlar", "asosiy"],
    isVerified: true,
    popularity: 85,
  },

  // Fruits
  {
    id: "olma",
    name: "Apple",
    nameUz: "Olma",
    category: "fruits",
    serving: { size: "1 dona", unit: "dona", grams: 180 },
    nutrition: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4.4,
      sugar: 19,
      sodium: 2,
    },
    tags: ["meva", "vitamin", "shirin"],
    isVerified: true,
    popularity: 88,
  },
  {
    id: "banan",
    name: "Banana",
    nameUz: "Banan",
    category: "fruits",
    serving: { size: "1 dona", unit: "dona", grams: 118 },
    nutrition: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14,
      sodium: 1,
    },
    tags: ["meva", "energiya", "kaliy"],
    isVerified: true,
    popularity: 91,
  },
  {
    id: "uzum",
    name: "Grapes",
    nameUz: "Uzum",
    category: "fruits",
    serving: { size: "1 stakan", unit: "stakan", grams: 150 },
    nutrition: {
      calories: 104,
      protein: 1.1,
      carbs: 27,
      fat: 0.2,
      fiber: 1.4,
      sugar: 23,
      sodium: 3,
    },
    tags: ["meva", "shirin", "vitamin"],
    isVerified: true,
    popularity: 82,
  },

  // Protein sources
  {
    id: "qoygoshtog",
    name: "Lamb",
    nameUz: "Qo'y go'shti",
    category: "protein",
    serving: { size: "100g", unit: "gramm", grams: 100 },
    nutrition: {
      calories: 294,
      protein: 25,
      carbs: 0,
      fat: 21,
      fiber: 0,
      sugar: 0,
      sodium: 72,
    },
    tags: ["go'sht", "oqsil", "qizil go'sht"],
    isVerified: true,
    popularity: 70,
  },
  {
    id: "tovuqsalat",
    name: "Chicken Salad",
    nameUz: "Tovuq salati",
    category: "protein",
    serving: { size: "1 kosa", unit: "kosa", grams: 220 },
    nutrition: {
      calories: 260,
      protein: 28,
      carbs: 10,
      fat: 12,
      fiber: 3,
      sugar: 5,
      sodium: 430,
    },
    tags: ["salat", "oqsil", "yengil"],
    isVerified: true,
    popularity: 80,
  },
  {
    id: "tovuqgoshti",
    name: "Chicken Breast",
    nameUz: "Tovuq go'shti",
    category: "protein",
    serving: { size: "100g", unit: "gramm", grams: 100 },
    nutrition: {
      calories: 231,
      protein: 31,
      carbs: 0,
      fat: 10,
      fiber: 0,
      sugar: 0,
      sodium: 104,
    },
    tags: ["go'sht", "oqsil", "oq go'sht"],
    isVerified: true,
    popularity: 85,
  },

  // Dairy
  {
    id: "tvorog",
    name: "Cottage Cheese",
    nameUz: "Tvorog",
    category: "dairy",
    serving: { size: "100g", unit: "gramm", grams: 100 },
    nutrition: {
      calories: 98,
      protein: 11,
      carbs: 3.4,
      fat: 4.3,
      fiber: 0,
      sugar: 2.7,
      sodium: 364,
    },
    tags: ["sut mahsuloti", "oqsil", "kaltsiy"],
    isVerified: true,
    popularity: 65,
  },
  {
    id: "sut",
    name: "Milk",
    nameUz: "Sut",
    category: "dairy",
    serving: { size: "1 stakan", unit: "stakan", grams: 240 },
    nutrition: {
      calories: 149,
      protein: 8,
      carbs: 12,
      fat: 8,
      fiber: 0,
      sugar: 12,
      sodium: 105,
    },
    tags: ["sut", "ichimlik", "kaltsiy"],
    isVerified: true,
    popularity: 90,
  },

  // Common snacks
  {
    id: "yongog",
    name: "Walnuts",
    nameUz: "Yong'oq",
    category: "nuts",
    serving: { size: "30g", unit: "gramm", grams: 30 },
    nutrition: {
      calories: 196,
      protein: 4.6,
      carbs: 4.1,
      fat: 19.6,
      fiber: 2,
      sugar: 0.8,
      sodium: 1,
    },
    tags: ["yong'oq", "foydali yog'", "oqsil"],
    isVerified: true,
    popularity: 70,
  },
  {
    id: "kurt",
    name: "Qurt",
    nameUz: "Qurt",
    category: "snacks",
    serving: { size: "30g", unit: "gramm", grams: 30 },
    nutrition: {
      calories: 120,
      protein: 10,
      carbs: 3,
      fat: 7,
      fiber: 0,
      sugar: 2,
      sodium: 420,
    },
    tags: ["milliy", "gazak", "oqsil"],
    isVerified: true,
    popularity: 68,
  },

  // Beverages
  {
    id: "kokchoy",
    name: "Green Tea",
    nameUz: "Kok choy",
    category: "beverages",
    serving: { size: "1 stakan", unit: "stakan", grams: 240 },
    nutrition: {
      calories: 2,
      protein: 0.5,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 2,
    },
    tags: ["ichimlik", "choy", "antioksidant"],
    isVerified: true,
    popularity: 95,
  },
  {
    id: "ayran",
    name: "Ayran",
    nameUz: "Ayran",
    category: "beverages",
    serving: { size: "1 stakan", unit: "stakan", grams: 250 },
    nutrition: {
      calories: 80,
      protein: 5,
      carbs: 6,
      fat: 3,
      fiber: 0,
      sugar: 5,
      sodium: 220,
    },
    tags: ["ichimlik", "sovutuvchi", "sut"],
    isVerified: true,
    popularity: 74,
  },
  {
    id: "suv",
    name: "Water",
    nameUz: "Suv",
    category: "beverages",
    serving: { size: "1 stakan", unit: "stakan", grams: 240 },
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: ["ichimlik", "suv", "asosiy"],
    isVerified: true,
    popularity: 100,
  },
];

// Search functions
export const searchFoods = (query: string, limit: number = 10): FoodItem[] => {
  if (!query.trim()) return [];

  // Normalize string: lowercased, remove spaces/apostrophes, unify g' / gʻ and o' / oʻ etc.
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[`ʼ’']/g, "'")
      .replace(/gʻ|gʼ|g’/g, "g'")
      .replace(/oʻ|oʼ|o’/g, "o'")
      .replace(/ /g, "")
      .trim();

  const searchTerm = normalize(query);

  const results = UZBEK_FOODS.filter((food) => {
    const nNameUz = normalize(food.nameUz);
    const nName = normalize(food.name);
    const nCategory = normalize(food.category);
    const tags = food.tags.map((t) => normalize(t));
    return (
      nNameUz.includes(searchTerm) ||
      nName.includes(searchTerm) ||
      tags.some((t) => t.includes(searchTerm)) ||
      nCategory.includes(searchTerm)
    );
  });

  // Sort by exactness then popularity
  return results
    .sort((a, b) => {
      const aExact =
        normalize(a.nameUz) === searchTerm || normalize(a.name) === searchTerm;
      const bExact =
        normalize(b.nameUz) === searchTerm || normalize(b.name) === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return b.popularity - a.popularity;
    })
    .slice(0, limit);
};

// Get popular foods
export const getPopularFoods = (limit: number = 10): FoodItem[] => {
  return UZBEK_FOODS.sort((a, b) => b.popularity - a.popularity).slice(
    0,
    limit,
  );
};

// Get foods by category
export const getFoodsByCategory = (categoryId: string): FoodItem[] => {
  return UZBEK_FOODS.filter((food) => food.category === categoryId).sort(
    (a, b) => b.popularity - a.popularity,
  );
};

// Get recent meals from storage
export const getRecentMeals = (
  telegramId: string,
  limit: number = 5,
): Meal[] => {
  const recentMeals: Meal[] = [];

  // Get last 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `tracking_${telegramId}_${dateKey}`;
    const data = localStorage.getItem(storageKey);

    if (data) {
      try {
        const tracking = JSON.parse(data);
        if (tracking.meals) {
          recentMeals.push(...tracking.meals);
        }
      } catch (error) {
        console.error("Error parsing tracking data:", error);
      }
    }
  }

  // Sort by timestamp and remove duplicates by name
  const uniqueMeals = recentMeals
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .filter(
      (meal, index, arr) =>
        arr.findIndex(
          (m) => m.name.toLowerCase() === meal.name.toLowerCase(),
        ) === index,
    );

  return uniqueMeals.slice(0, limit);
};

// Calculate nutrition for custom portion
export const calculateNutrition = (food: FoodItem, portionSize: number) => {
  return {
    calories: Math.round(food.nutrition.calories * portionSize),
    protein: Math.round(food.nutrition.protein * portionSize * 10) / 10,
    carbs: Math.round(food.nutrition.carbs * portionSize * 10) / 10,
    fat: Math.round(food.nutrition.fat * portionSize * 10) / 10,
    fiber: Math.round(food.nutrition.fiber * portionSize * 10) / 10,
    sugar: Math.round(food.nutrition.sugar * portionSize * 10) / 10,
    sodium: Math.round(food.nutrition.sodium * portionSize * 10) / 10,
  };
};

// AI food recognition simulation
export const simulateAIRecognition = (
  imageName?: string,
): Promise<{
  food: FoodItem;
  confidence: number;
  portion: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        // Simulate AI recognition with random food
        const foods = getPopularFoods(5);
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        const confidence = 75 + Math.random() * 20; // 75-95% confidence
        const portion = 0.8 + Math.random() * 0.4; // 0.8-1.2 portions

        resolve({
          food: randomFood,
          confidence: Math.round(confidence),
          portion: Math.round(portion * 10) / 10,
        });
      },
      1500 + Math.random() * 1000,
    ); // 1.5-2.5 second delay
  });
};

// Quick add presets for common meals
export const QUICK_ADD_PRESETS = [
  {
    id: "breakfast-simple",
    name: "Oddiy nonushta",
    icon: "🌅",
    items: [
      { foodId: "non", portion: 1 },
      { foodId: "tvorog", portion: 1 },
      { foodId: "kokchoy", portion: 1 },
    ],
  },
  {
    id: "lunch-uzbek",
    name: "Milliy tushlik",
    icon: "🍲",
    items: [
      { foodId: "osh", portion: 1 },
      { foodId: "salat", portion: 0.5 },
    ],
  },
  {
    id: "snack-healthy",
    name: "Sog'lom gazak",
    icon: "🍎",
    items: [
      { foodId: "olma", portion: 1 },
      { foodId: "yongog", portion: 0.5 },
    ],
  },
];

// Nutrition quality scoring
export const getNutritionScore = (nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}): {
  score: number;
  grade: string;
  feedback: string[];
} => {
  let score = 50; // Base score
  const feedback: string[] = [];

  // Protein evaluation (aim for 15-30% of calories)
  const proteinPercent = ((nutrition.protein * 4) / nutrition.calories) * 100;
  if (proteinPercent >= 15 && proteinPercent <= 30) {
    score += 20;
    feedback.push("✅ Yaxshi oqsil miqdori");
  } else if (proteinPercent < 15) {
    score -= 10;
    feedback.push("⚠️ Oqsil kam, ko'proq qo'shing");
  } else {
    score -= 5;
    feedback.push("⚠️ Oqsil haddan tashqari ko'p");
  }

  // Fiber evaluation (aim for 3g+ per 100 calories)
  const fiberRatio = nutrition.fiber / (nutrition.calories / 100);
  if (fiberRatio >= 3) {
    score += 15;
    feedback.push("✅ Yetarli tola miqdori");
  } else if (fiberRatio >= 1.5) {
    score += 5;
    feedback.push("👍 O'rtacha tola miqdori");
  } else {
    score -= 10;
    feedback.push("⚠️ Tola kam, sabzavot qo'shing");
  }

  // Fat evaluation (aim for 20-35% of calories)
  const fatPercent = ((nutrition.fat * 9) / nutrition.calories) * 100;
  if (fatPercent >= 20 && fatPercent <= 35) {
    score += 10;
  } else if (fatPercent > 35) {
    score -= 15;
    feedback.push("⚠️ Yog' haddan tashqari ko'p");
  } else {
    score -= 5;
    feedback.push("⚠️ Yog' kam");
  }

  // Calorie density evaluation
  if (nutrition.calories <= 150) {
    score += 10;
    feedback.push("✅ Kam kaloriyali");
  } else if (nutrition.calories >= 500) {
    score -= 10;
    feedback.push("⚠️ Yuqori kaloriyali");
  }

  score = Math.max(0, Math.min(100, score));

  let grade = "F";
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";

  return { score, grade, feedback };
};
