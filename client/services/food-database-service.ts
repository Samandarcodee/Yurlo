/**
 * Professional Food Database Service
 * Comprehensive Russian and Uzbek food database with nutrition information
 */

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
  vitaminA?: number;
}

export interface FoodItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  category: FoodCategory;
  subcategory?: string;
  nutritionPer100g: NutritionInfo;
  commonPortions: Portion[];
  keywords: string[];
  barcode?: string;
  image?: string;
  description?: string;
  cookingMethods?: string[];
  allergens?: string[];
  isPopular: boolean;
  isTraditional: boolean;
  region?: 'uzbek' | 'russian' | 'central_asian' | 'international';
}

export interface Portion {
  name: string;
  nameUz: string;
  nameRu: string;
  grams: number;
  description?: string;
}

export type FoodCategory = 
  | 'grains_cereals'     // Don va galladonalar
  | 'vegetables'         // Sabzavotlar
  | 'fruits'            // Mevalar
  | 'meat_poultry'      // Go'sht va parranda
  | 'fish_seafood'      // Baliq va dengiz mahsulotlari
  | 'dairy'             // Sut mahsulotlari
  | 'legumes_nuts'      // Dukkakli va yong'oqlar
  | 'oils_fats'         // Yog'lar
  | 'sweets_desserts'   // Shirinliklar
  | 'beverages'         // Ichimliklar
  | 'spices_herbs'      // Ziravorlar
  | 'traditional_uzbek' // An'anaviy o'zbek taomlar
  | 'traditional_russian' // An'anaviy rus taomlar
  | 'prepared_foods'    // Tayyor taomlar
  | 'snacks';           // Gazaklar

// === COMPREHENSIVE UZBEK AND RUSSIAN FOOD DATABASE === //

export const UZBEK_TRADITIONAL_FOODS: FoodItem[] = [
  {
    id: 'uzb_plov_001',
    nameUz: 'Palov',
    nameRu: 'Плов',
    nameEn: 'Plov',
    category: 'traditional_uzbek',
    subcategory: 'main_dishes',
    nutritionPer100g: {
      calories: 215,
      protein: 8.2,
      carbs: 35.4,
      fat: 5.1,
      fiber: 1.8,
      sodium: 420,
      potassium: 180,
      iron: 1.2
    },
    commonPortions: [
      { name: 'serving', nameUz: 'porsiya', nameRu: 'порция', grams: 250 },
      { name: 'large_serving', nameUz: 'katta porsiya', nameRu: 'большая порция', grams: 350 },
      { name: 'small_serving', nameUz: 'kichik porsiya', nameRu: 'малая порция', grams: 150 }
    ],
    keywords: ['palov', 'osh', 'guruch', 'go\'sht', 'sabzi', 'плов', 'рис', 'мясо', 'морковь'],
    isPopular: true,
    isTraditional: true,
    region: 'uzbek',
    description: 'Milliy o\'zbek taomi - guruch, go\'sht va sabzi asosida',
    cookingMethods: ['qovurish', 'bug\'da pishirish']
  },
  {
    id: 'uzb_lagman_001',
    nameUz: 'Lag\'mon',
    nameRu: 'Лагман',
    nameEn: 'Lagman',
    category: 'traditional_uzbek',
    subcategory: 'soups',
    nutritionPer100g: {
      calories: 120,
      protein: 6.8,
      carbs: 18.2,
      fat: 2.9,
      fiber: 2.1,
      sodium: 380,
      potassium: 220
    },
    commonPortions: [
      { name: 'bowl', nameUz: 'kosa', nameRu: 'тарелка', grams: 300 },
      { name: 'large_bowl', nameUz: 'katta kosa', nameRu: 'большая тарелка', grams: 450 }
    ],
    keywords: ['lagmon', 'sho\'rva', 'noodles', 'лагман', 'суп', 'лапша'],
    isPopular: true,
    isTraditional: true,
    region: 'uzbek'
  },
  {
    id: 'uzb_manti_001',
    nameUz: 'Manti',
    nameRu: 'Манты',
    nameEn: 'Manti',
    category: 'traditional_uzbek',
    subcategory: 'dumplings',
    nutritionPer100g: {
      calories: 195,
      protein: 12.4,
      carbs: 23.1,
      fat: 6.8,
      fiber: 1.5,
      sodium: 320
    },
    commonPortions: [
      { name: 'piece', nameUz: 'dona', nameRu: 'штука', grams: 80 },
      { name: 'serving_4pcs', nameUz: '4 dona', nameRu: '4 штуки', grams: 320 }
    ],
    keywords: ['manti', 'bug\'da pishirilgan', 'go\'sht', 'манты', 'на пару', 'мясо'],
    isPopular: true,
    isTraditional: true,
    region: 'uzbek'
  },
  {
    id: 'uzb_somsa_001',
    nameUz: 'Somsa',
    nameRu: 'Самса',
    nameEn: 'Samsa',
    category: 'traditional_uzbek',
    subcategory: 'baked_goods',
    nutritionPer100g: {
      calories: 280,
      protein: 11.2,
      carbs: 28.5,
      fat: 14.3,
      fiber: 2.2,
      sodium: 450
    },
    commonPortions: [
      { name: 'piece', nameUz: 'dona', nameRu: 'штука', grams: 120 },
      { name: 'large_piece', nameUz: 'katta dona', nameRu: 'большая', grams: 180 }
    ],
    keywords: ['somsa', 'tandir', 'go\'sht', 'piyoz', 'самса', 'тандыр', 'мясо', 'лук'],
    isPopular: true,
    isTraditional: true,
    region: 'uzbek'
  },
  {
    id: 'uzb_norin_001',
    nameUz: 'Norin',
    nameRu: 'Норин',
    nameEn: 'Norin',
    category: 'traditional_uzbek',
    subcategory: 'cold_dishes',
    nutritionPer100g: {
      calories: 165,
      protein: 9.8,
      carbs: 20.4,
      fat: 5.2,
      fiber: 1.8,
      sodium: 290
    },
    commonPortions: [
      { name: 'serving', nameUz: 'porsiya', nameRu: 'порция', grams: 200 }
    ],
    keywords: ['norin', 'sovuq taom', 'makaron', 'go\'sht', 'норин', 'холодное', 'лапша'],
    isPopular: true,
    isTraditional: true,
    region: 'uzbek'
  }
];

export const RUSSIAN_TRADITIONAL_FOODS: FoodItem[] = [
  {
    id: 'rus_borsch_001',
    nameUz: 'Borsh',
    nameRu: 'Борщ',
    nameEn: 'Borscht',
    category: 'traditional_russian',
    subcategory: 'soups',
    nutritionPer100g: {
      calories: 45,
      protein: 2.8,
      carbs: 6.2,
      fat: 1.5,
      fiber: 2.1,
      sodium: 320,
      vitaminC: 12,
      vitaminA: 850
    },
    commonPortions: [
      { name: 'bowl', nameUz: 'kosa', nameRu: 'тарелка', grams: 300 },
      { name: 'large_bowl', nameUz: 'katta kosa', nameRu: 'большая тарелка', grams: 450 }
    ],
    keywords: ['borsh', 'sho\'rva', 'qizil lavlagi', 'борщ', 'суп', 'свекла', 'капуста'],
    isPopular: true,
    isTraditional: true,
    region: 'russian'
  },
  {
    id: 'rus_olivier_001',
    nameUz: 'Olivier salati',
    nameRu: 'Салат Оливье',
    nameEn: 'Olivier Salad',
    category: 'traditional_russian',
    subcategory: 'salads',
    nutritionPer100g: {
      calories: 185,
      protein: 5.8,
      carbs: 12.4,
      fat: 13.2,
      fiber: 1.8,
      sodium: 420
    },
    commonPortions: [
      { name: 'serving', nameUz: 'porsiya', nameRu: 'порция', grams: 150 },
      { name: 'large_serving', nameUz: 'katta porsiya', nameRu: 'большая порция', grams: 200 }
    ],
    keywords: ['olivier', 'salat', 'kartoshka', 'tuxum', 'оливье', 'салат', 'картофель', 'яйцо'],
    isPopular: true,
    isTraditional: true,
    region: 'russian'
  },
  {
    id: 'rus_pelmeni_001',
    nameUz: 'Pelmeni',
    nameRu: 'Пельмени',
    nameEn: 'Pelmeni',
    category: 'traditional_russian',
    subcategory: 'dumplings',
    nutritionPer100g: {
      calories: 245,
      protein: 13.8,
      carbs: 26.4,
      fat: 9.2,
      fiber: 1.2,
      sodium: 380
    },
    commonPortions: [
      { name: 'serving_10pcs', nameUz: '10 dona', nameRu: '10 штук', grams: 200 },
      { name: 'large_serving_15pcs', nameUz: '15 dona', nameRu: '15 штук', grams: 300 }
    ],
    keywords: ['pelmeni', 'go\'sht', 'xamir', 'пельмени', 'мясо', 'тесто'],
    isPopular: true,
    isTraditional: true,
    region: 'russian'
  },
  {
    id: 'rus_blini_001',
    nameUz: 'Blini',
    nameRu: 'Блины',
    nameEn: 'Blini',
    category: 'traditional_russian',
    subcategory: 'pancakes',
    nutritionPer100g: {
      calories: 195,
      protein: 6.8,
      carbs: 25.2,
      fat: 7.4,
      fiber: 1.1,
      sodium: 180
    },
    commonPortions: [
      { name: 'piece', nameUz: 'dona', nameRu: 'штука', grams: 50 },
      { name: 'serving_3pcs', nameUz: '3 dona', nameRu: '3 штуки', grams: 150 }
    ],
    keywords: ['blini', 'quymoq', 'un', 'sut', 'блины', 'блинчики', 'мука', 'молоко'],
    isPopular: true,
    isTraditional: true,
    region: 'russian'
  }
];

export const COMMON_INGREDIENTS: FoodItem[] = [
  // Grains & Cereals
  {
    id: 'grain_rice_001',
    nameUz: 'Guruch',
    nameRu: 'Рис',
    nameEn: 'Rice',
    category: 'grains_cereals',
    nutritionPer100g: {
      calories: 365,
      protein: 7.1,
      carbs: 78.9,
      fat: 0.7,
      fiber: 1.3
    },
    commonPortions: [
      { name: 'cup_cooked', nameUz: 'stakan pishgan', nameRu: 'стакан вареный', grams: 195 },
      { name: 'cup_raw', nameUz: 'stakan xom', nameRu: 'стакан сырой', grams: 185 }
    ],
    keywords: ['guruch', 'don', 'рис', 'крупа'],
    isPopular: true,
    isTraditional: false,
    region: 'international'
  },
  {
    id: 'vegetable_carrot_001',
    nameUz: 'Sabzi',
    nameRu: 'Морковь',
    nameEn: 'Carrot',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 41,
      protein: 0.9,
      carbs: 9.6,
      fat: 0.2,
      fiber: 2.8,
      vitaminA: 16700,
      vitaminC: 5.9
    },
    commonPortions: [
      { name: 'medium', nameUz: 'o\'rtacha', nameRu: 'средняя', grams: 80 },
      { name: 'large', nameUz: 'katta', nameRu: 'большая', grams: 120 },
      { name: 'cup_chopped', nameUz: 'stakan to\'g\'ralgan', nameRu: 'стакан нарезанной', grams: 130 }
    ],
    keywords: ['sabzi', 'qizil', 'vitamin', 'морковь', 'овощ', 'витамин'],
    isPopular: true,
    isTraditional: false,
    region: 'international'
  },
  {
    id: 'meat_beef_001',
    nameUz: 'Mol go\'shti',
    nameRu: 'Говядина',
    nameEn: 'Beef',
    category: 'meat_poultry',
    nutritionPer100g: {
      calories: 250,
      protein: 26.0,
      carbs: 0,
      fat: 15.0,
      fiber: 0,
      iron: 2.6,
      potassium: 318
    },
    commonPortions: [
      { name: 'serving', nameUz: 'porsiya', nameRu: 'порция', grams: 150 },
      { name: 'steak', nameUz: 'bifshteks', nameRu: 'стейк', grams: 200 }
    ],
    keywords: ['mol go\'shti', 'qizil go\'sht', 'oqsil', 'говядина', 'мясо', 'белок'],
    isPopular: true,
    isTraditional: false,
    region: 'international'
  },
  // Add more common ingredients...
];

export const ALL_FOODS: FoodItem[] = [
  ...UZBEK_TRADITIONAL_FOODS,
  ...RUSSIAN_TRADITIONAL_FOODS,
  ...COMMON_INGREDIENTS
];

// === FOOD DATABASE SERVICE CLASS === //

class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  private foods: FoodItem[] = ALL_FOODS;
  private searchIndex: Map<string, FoodItem[]> = new Map();

  constructor() {
    this.buildSearchIndex();
  }

  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }

  private buildSearchIndex() {
    this.foods.forEach(food => {
      // Index by name variations
      const searchTerms = [
        food.nameUz.toLowerCase(),
        food.nameRu.toLowerCase(),
        food.nameEn.toLowerCase(),
        ...food.keywords.map(k => k.toLowerCase())
      ];

      searchTerms.forEach(term => {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, []);
        }
        this.searchIndex.get(term)!.push(food);
      });
    });
  }

  // Search foods with fuzzy matching
  searchFoods(query: string, limit: number = 20): FoodItem[] {
    if (!query.trim()) return this.getPopularFoods(limit);

    const lowerQuery = query.toLowerCase().trim();
    const results = new Set<FoodItem>();
    
    // Exact matches first
    this.searchIndex.forEach((foods, term) => {
      if (term.includes(lowerQuery)) {
        foods.forEach(food => results.add(food));
      }
    });

    // Partial matches
    if (results.size < limit) {
      this.foods.forEach(food => {
        const searchText = `${food.nameUz} ${food.nameRu} ${food.nameEn} ${food.keywords.join(' ')}`.toLowerCase();
        if (searchText.includes(lowerQuery)) {
          results.add(food);
        }
      });
    }

    return Array.from(results).slice(0, limit);
  }

  // Get foods by category
  getFoodsByCategory(category: FoodCategory): FoodItem[] {
    return this.foods.filter(food => food.category === category);
  }

  // Get popular foods
  getPopularFoods(limit: number = 10): FoodItem[] {
    return this.foods.filter(food => food.isPopular).slice(0, limit);
  }

  // Get traditional foods by region
  getTraditionalFoods(region?: 'uzbek' | 'russian'): FoodItem[] {
    return this.foods.filter(food => 
      food.isTraditional && (!region || food.region === region)
    );
  }

  // Get food by ID
  getFoodById(id: string): FoodItem | undefined {
    return this.foods.find(food => food.id === id);
  }

  // Calculate nutrition for portion
  calculateNutritionForPortion(food: FoodItem, grams: number): NutritionInfo {
    const multiplier = grams / 100;
    const nutrition = food.nutritionPer100g;
    
    return {
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
      sugar: nutrition.sugar ? Math.round(nutrition.sugar * multiplier * 10) / 10 : undefined,
      sodium: nutrition.sodium ? Math.round(nutrition.sodium * multiplier) : undefined,
      potassium: nutrition.potassium ? Math.round(nutrition.potassium * multiplier) : undefined,
      calcium: nutrition.calcium ? Math.round(nutrition.calcium * multiplier) : undefined,
      iron: nutrition.iron ? Math.round(nutrition.iron * multiplier * 10) / 10 : undefined,
      vitaminC: nutrition.vitaminC ? Math.round(nutrition.vitaminC * multiplier * 10) / 10 : undefined,
      vitaminA: nutrition.vitaminA ? Math.round(nutrition.vitaminA * multiplier) : undefined
    };
  }

  // Get food suggestions based on current meal
  getFoodSuggestions(currentMeals: any[], mealType: string, limit: number = 5): FoodItem[] {
    // Simple algorithm - can be enhanced with ML
    const suggestions = this.foods.filter(food => {
      // Different suggestions for different meal types
      if (mealType === 'breakfast') {
        return food.keywords.some(k => 
          ['non', 'choy', 'tuxum', 'sut', 'хлеб', 'чай', 'яйцо', 'молоко'].includes(k)
        );
      } else if (mealType === 'lunch' || mealType === 'dinner') {
        return food.category === 'traditional_uzbek' || food.category === 'traditional_russian';
      }
      return food.isPopular;
    });

    return suggestions.slice(0, limit);
  }

  // Add custom food (for user-added foods)
  addCustomFood(food: Omit<FoodItem, 'id'>): string {
    const id = `custom_${Date.now()}`;
    const newFood: FoodItem = { ...food, id };
    this.foods.push(newFood);
    
    // Update search index
    this.buildSearchIndex();
    
    // Save to localStorage
    const customFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
    customFoods.push(newFood);
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
    
    return id;
  }

  // Load custom foods from localStorage
  loadCustomFoods() {
    const customFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
    this.foods.push(...customFoods);
    this.buildSearchIndex();
  }

  // Get all categories
  getCategories(): Array<{id: FoodCategory, nameUz: string, nameRu: string, nameEn: string}> {
    return [
      { id: 'traditional_uzbek', nameUz: 'O\'zbek taomlar', nameRu: 'Узбекские блюда', nameEn: 'Uzbek dishes' },
      { id: 'traditional_russian', nameUz: 'Rus taomlar', nameRu: 'Русские блюда', nameEn: 'Russian dishes' },
      { id: 'grains_cereals', nameUz: 'Don va galladonalar', nameRu: 'Крупы и злаки', nameEn: 'Grains & cereals' },
      { id: 'vegetables', nameUz: 'Sabzavotlar', nameRu: 'Овощи', nameEn: 'Vegetables' },
      { id: 'fruits', nameUz: 'Mevalar', nameRu: 'Фрукты', nameEn: 'Fruits' },
      { id: 'meat_poultry', nameUz: 'Go\'sht va parranda', nameRu: 'Мясо и птица', nameEn: 'Meat & poultry' },
      { id: 'fish_seafood', nameUz: 'Baliq va dengiz mahsulotlari', nameRu: 'Рыба и морепродукты', nameEn: 'Fish & seafood' },
      { id: 'dairy', nameUz: 'Sut mahsulotlari', nameRu: 'Молочные продукты', nameEn: 'Dairy' },
      { id: 'legumes_nuts', nameUz: 'Dukkakli va yong\'oqlar', nameRu: 'Бобовые и орехи', nameEn: 'Legumes & nuts' },
      { id: 'sweets_desserts', nameUz: 'Shirinliklar', nameRu: 'Сладости и десерты', nameEn: 'Sweets & desserts' },
      { id: 'beverages', nameUz: 'Ichimliklar', nameRu: 'Напитки', nameEn: 'Beverages' },
      { id: 'prepared_foods', nameUz: 'Tayyor taomlar', nameRu: 'Готовые блюда', nameEn: 'Prepared foods' },
      { id: 'snacks', nameUz: 'Gazaklar', nameRu: 'Закуски', nameEn: 'Snacks' }
    ];
  }
}

export default FoodDatabaseService;