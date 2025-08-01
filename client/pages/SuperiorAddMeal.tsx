/**
 * Superior Add Meal Component - Advanced Food Tracking
 * Professional UI/UX with comprehensive functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Search, Clock, Utensils, Zap, CheckCircle, Star,
  History, Flame, Plus, Minus, Edit3, TrendingUp, ArrowLeft,
  Scan, ChefHat, Timer, Target, Scale, Info, Bookmark,
  MoreHorizontal, Filter, SortAsc, Calendar, MapPin,
  Smartphone, Barcode, Users, Heart, Award, Trash2,
  Copy, Share2, Save, RefreshCw, AlertCircle, ChevronDown,
  ChevronRight, X, Check, Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';

// Enhanced interfaces
interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  cholesterol?: number;
  vitamins?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB12?: number;
  };
  minerals?: {
    calcium?: number;
    iron?: number;
    potassium?: number;
  };
}

interface FoodItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  category: string;
  subcategory?: string;
  nutrition: NutritionInfo;
  portionSizes: {
    name: string;
    grams: number;
    description?: string;
  }[];
  tags: string[];
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  preparation?: string[];
  allergens?: string[];
  healthScore?: number;
  verified?: boolean;
  userAdded?: boolean;
}

interface MealEntry {
  id: string;
  food: FoodItem;
  portion: number;
  portionType: string;
  grams: number;
  nutrition: NutritionInfo;
  timestamp: string;
  notes?: string;
  location?: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor';
  satisfaction?: number; // 1-10
  preparationTime?: number;
  cost?: number;
  sharedWith?: string[];
  photoUrl?: string;
  customName?: string;
}

type AddMode = 'quick' | 'search' | 'barcode' | 'photo' | 'manual' | 'recipe';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
type SortMode = 'popular' | 'recent' | 'alphabetical' | 'calories' | 'protein';

export default function SuperiorAddMeal() {
  const { user } = useUser();
  const { user: telegramUser, hapticFeedback, showAlert, showConfirm } = useTelegram();
  const navigate = useNavigate();

  // Core states
  const [activeMode, setActiveMode] = useState<AddMode>('search');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [currentMeal, setCurrentMeal] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  // Food data
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [favoriteB, setFavoriteFoods] = useState<FoodItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // UI states
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState(100);
  const [portionType, setPortionType] = useState('grams');
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Advanced tracking
  const [mealNotes, setMealNotes] = useState('');
  const [mealLocation, setMealLocation] = useState('');
  const [moodRating, setMoodRating] = useState<'excellent' | 'good' | 'neutral' | 'poor'>('good');
  const [satisfactionRating, setSatisfactionRating] = useState(7);
  const [preparationTime, setPreparationTime] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Categories with enhanced structure
  const categories = [
    { id: 'all', nameUz: 'Barchasi', nameRu: 'Все', nameEn: 'All', icon: '🍽️' },
    { id: 'fruits', nameUz: 'Mevalar', nameRu: 'Фрукты', nameEn: 'Fruits', icon: '🍎' },
    { id: 'vegetables', nameUz: 'Sabzavotlar', nameRu: 'Овощи', nameEn: 'Vegetables', icon: '🥬' },
    { id: 'grains', nameUz: 'Donli mahsulotlar', nameRu: 'Зерновые', nameEn: 'Grains', icon: '🌾' },
    { id: 'proteins', nameUz: 'Oqsil', nameRu: 'Белки', nameEn: 'Proteins', icon: '🥩' },
    { id: 'dairy', nameUz: 'Sut mahsulotlari', nameRu: 'Молочные', nameEn: 'Dairy', icon: '🥛' },
    { id: 'nuts', nameUz: 'Yong\'oqlar', nameRu: 'Орехи', nameEn: 'Nuts', icon: '🥜' },
    { id: 'beverages', nameUz: 'Ichimliklar', nameRu: 'Напитки', nameEn: 'Beverages', icon: '🥤' },
    { id: 'uzbek', nameUz: 'O\'zbek taomlar', nameRu: 'Узбекские блюда', nameEn: 'Uzbek Dishes', icon: '🍛' },
    { id: 'russian', nameUz: 'Rus taomlar', nameRu: 'Русские блюда', nameEn: 'Russian Dishes', icon: '🥟' },
    { id: 'sweets', nameUz: 'Shirinliklar', nameRu: 'Сладости', nameEn: 'Sweets', icon: '🍰' },
    { id: 'fast_food', nameUz: 'Fast food', nameRu: 'Фаст-фуд', nameEn: 'Fast Food', icon: '🍔' }
  ];

  // Quick add presets for common Uzbek/Russian foods
  const quickAddPresets = [
    { 
      id: 'osh', 
      nameUz: 'Osh', 
      nameRu: 'Плов', 
      calories: 420, 
      protein: 18, 
      carbs: 58, 
      fat: 12,
      icon: '🍛',
      portion: 250
    },
    { 
      id: 'lagman', 
      nameUz: 'Lag\'mon', 
      nameRu: 'Лагман', 
      calories: 350, 
      protein: 15, 
      carbs: 48, 
      fat: 10,
      icon: '🍜',
      portion: 300
    },
    { 
      id: 'shashlik', 
      nameUz: 'Shashlik', 
      nameRu: 'Шашлык', 
      calories: 380, 
      protein: 32, 
      carbs: 2, 
      fat: 28,
      icon: '🍢',
      portion: 150
    },
    { 
      id: 'manti', 
      nameUz: 'Manti', 
      nameRu: 'Манты', 
      calories: 290, 
      protein: 14, 
      carbs: 35, 
      fat: 11,
      icon: '🥟',
      portion: 200
    },
    { 
      id: 'non', 
      nameUz: 'Non', 
      nameRu: 'Лепешка', 
      calories: 180, 
      protein: 6, 
      carbs: 36, 
      fat: 2,
      icon: '🫓',
      portion: 80
    },
    { 
      id: 'green_tea', 
      nameUz: 'Kok choy', 
      nameRu: 'Зеленый чай', 
      calories: 2, 
      protein: 0, 
      carbs: 0, 
      fat: 0,
      icon: '🍵',
      portion: 250
    }
  ];

  // Calculate total nutrition for current meal
  const totalNutrition = useMemo(() => {
    return currentMeal.reduce((total, entry) => ({
      calories: total.calories + entry.nutrition.calories,
      protein: total.protein + entry.nutrition.protein,
      carbs: total.carbs + entry.nutrition.carbs,
      fat: total.fat + entry.nutrition.fat,
      fiber: total.fiber + entry.nutrition.fiber,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [currentMeal]);

  // Mock data loading
  useEffect(() => {
    loadFoodData();
  }, []);

  const loadFoodData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockFoods: FoodItem[] = [
      {
        id: '1',
        nameUz: 'Osh',
        nameRu: 'Плов',
        nameEn: 'Pilaf',
        category: 'uzbek',
        nutrition: { calories: 420, protein: 18, carbs: 58, fat: 12, fiber: 3 },
        portionSizes: [
          { name: 'Kichik', grams: 200 },
          { name: 'O\'rtacha', grams: 250 },
          { name: 'Katta', grams: 350 }
        ],
        tags: ['o\'zbek', 'asosiy', 'guruch'],
        healthScore: 7,
        verified: true
      },
      {
        id: '2',
        nameUz: 'Olma',
        nameRu: 'Яблоко',
        nameEn: 'Apple',
        category: 'fruits',
        nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
        portionSizes: [
          { name: '1 dona', grams: 185 },
          { name: 'Yarim', grams: 90 }
        ],
        tags: ['meva', 'sog\'lom', 'vitamin'],
        healthScore: 9,
        verified: true
      }
      // Add more foods...
    ];

    setPopularFoods(mockFoods);
    setSearchResults(mockFoods);
    setLoading(false);
  };

  const handleQuickAdd = (preset: typeof quickAddPresets[0]) => {
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      food: {
        id: preset.id,
        nameUz: preset.nameUz,
        nameRu: preset.nameRu,
        nameEn: preset.nameUz,
        category: 'quick',
        nutrition: {
          calories: preset.calories,
          protein: preset.protein,
          carbs: preset.carbs,
          fat: preset.fat,
          fiber: 2
        },
        portionSizes: [{ name: 'Standart', grams: preset.portion }],
        tags: ['tez'],
        verified: true
      },
      portion: preset.portion,
      portionType: 'grams',
      grams: preset.portion,
      nutrition: {
        calories: preset.calories,
        protein: preset.protein,
        carbs: preset.carbs,
        fat: preset.fat,
        fiber: 2
      },
      timestamp: new Date().toISOString()
    };

    setCurrentMeal(prev => [...prev, newEntry]);
    hapticFeedback.impact('light');
  };

  const addFoodToMeal = () => {
    if (!selectedFood) return;

    const nutritionPerGram = {
      calories: selectedFood.nutrition.calories / 100,
      protein: selectedFood.nutrition.protein / 100,
      carbs: selectedFood.nutrition.carbs / 100,
      fat: selectedFood.nutrition.fat / 100,
      fiber: selectedFood.nutrition.fiber / 100,
    };

    const actualGrams = portionType === 'grams' ? portion : 
      selectedFood.portionSizes.find(p => p.name === portionType)?.grams || 100;

    const newEntry: MealEntry = {
      id: Date.now().toString(),
      food: selectedFood,
      portion,
      portionType,
      grams: actualGrams,
      nutrition: {
        calories: Math.round(nutritionPerGram.calories * actualGrams),
        protein: Math.round(nutritionPerGram.protein * actualGrams * 10) / 10,
        carbs: Math.round(nutritionPerGram.carbs * actualGrams * 10) / 10,
        fat: Math.round(nutritionPerGram.fat * actualGrams * 10) / 10,
        fiber: Math.round(nutritionPerGram.fiber * actualGrams * 10) / 10,
      },
      timestamp: new Date().toISOString(),
      notes: mealNotes,
      location: mealLocation,
      mood: moodRating,
      satisfaction: satisfactionRating,
      preparationTime: preparationTime || undefined,
      cost: estimatedCost || undefined
    };

    setCurrentMeal(prev => [...prev, newEntry]);
    setSelectedFood(null);
    setPortion(100);
    setMealNotes('');
    hapticFeedback.impact('light');
  };

  const removeFoodFromMeal = (entryId: string) => {
    setCurrentMeal(prev => prev.filter(entry => entry.id !== entryId));
    hapticFeedback.impact('light');
  };

  const saveMeal = async () => {
    if (currentMeal.length === 0) {
      showAlert('Ovqat qo\'shing!');
      return;
    }

    setLoading(true);
    try {
      // Save to user data
      const mealData = {
        id: Date.now().toString(),
        type: mealType,
        entries: currentMeal,
        totalNutrition,
        timestamp: new Date().toISOString(),
        notes: mealNotes,
        location: mealLocation,
        mood: moodRating,
        satisfaction: satisfactionRating
      };

      // Here you would save to your data store
      console.log('Saving meal:', mealData);

      hapticFeedback.notification('success');
      showAlert('Ovqat muvaffaqiyatli saqlandi!');
      navigate('/');
    } catch (error) {
      console.error('Error saving meal:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = (query: string) => {
    if (!query.trim()) {
      setSearchResults(popularFoods);
      return;
    }

    const filtered = popularFoods.filter(food =>
      food.nameUz.toLowerCase().includes(query.toLowerCase()) ||
      food.nameRu.toLowerCase().includes(query.toLowerCase()) ||
      food.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      food.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(filtered);
  };

  useEffect(() => {
    searchFoods(searchQuery);
  }, [searchQuery, popularFoods]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Ovqat qo'shish</h1>
                <p className="text-sm text-slate-400">
                  {mealType === 'breakfast' && 'Nonushta'}
                  {mealType === 'lunch' && 'Tushlik'}
                  {mealType === 'dinner' && 'Kechki ovqat'}
                  {mealType === 'snack' && 'Gazak'}
                  {mealType === 'drink' && 'Ichimlik'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-slate-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div className="flex space-x-2 mt-4">
            {(['breakfast', 'lunch', 'dinner', 'snack', 'drink'] as MealType[]).map((type) => (
              <Button
                key={type}
                variant={mealType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setMealType(type)}
                className={`text-xs ${
                  mealType === type 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type === 'breakfast' && '🌅 Nonushta'}
                {type === 'lunch' && '☀️ Tushlik'}
                {type === 'dinner' && '🌙 Kechki ovqat'}
                {type === 'snack' && '🍎 Gazak'}
                {type === 'drink' && '🥤 Ichimlik'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Current Meal Summary */}
        {currentMeal.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-800/90 border-b border-slate-700/50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Joriy ovqat</h3>
              <Badge variant="secondary" className="bg-green-600 text-white">
                {currentMeal.length} ta mahsulot
              </Badge>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-sm font-bold text-green-400">{totalNutrition.calories}</div>
                <div className="text-xs text-slate-400">kcal</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-sm font-bold text-blue-400">{totalNutrition.protein.toFixed(1)}g</div>
                <div className="text-xs text-slate-400">Oqsil</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-sm font-bold text-orange-400">{totalNutrition.carbs.toFixed(1)}g</div>
                <div className="text-xs text-slate-400">Uglevod</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-sm font-bold text-yellow-400">{totalNutrition.fat.toFixed(1)}g</div>
                <div className="text-xs text-slate-400">Yog'</div>
              </div>
            </div>

            <div className="space-y-2">
              {currentMeal.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2">
                  <div className="flex-1">
                    <div className="text-white text-sm">{entry.food.nameUz}</div>
                    <div className="text-slate-400 text-xs">
                      {entry.grams}g • {entry.nutrition.calories} kcal
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFoodFromMeal(entry.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={saveMeal}
              disabled={loading}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Ovqatni saqlash
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="p-4 pb-20">
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as AddMode)}>
            <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
              <TabsTrigger value="quick" className="text-xs">Tez</TabsTrigger>
              <TabsTrigger value="search" className="text-xs">Qidiruv</TabsTrigger>
              <TabsTrigger value="photo" className="text-xs">Rasm</TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
            </TabsList>

            {/* Quick Add Tab */}
            <TabsContent value="quick" className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-3">Tez qo'shish</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickAddPresets.map((preset) => (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handleQuickAdd(preset)}
                        className="w-full h-auto p-3 bg-slate-800 border-slate-600 hover:bg-slate-700 flex flex-col items-center space-y-2"
                      >
                        <span className="text-2xl">{preset.icon}</span>
                        <div className="text-center">
                          <div className="text-white text-sm font-medium">{preset.nameUz}</div>
                          <div className="text-slate-400 text-xs">{preset.calories} kcal</div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Ovqat nomi yoki mahsulotni qidiring..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                {/* Categories */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {categories.slice(0, 8).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? '' : category.id
                      )}
                      className={`whitespace-nowrap text-xs ${
                        selectedCategory === category.id
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {category.icon} {category.nameUz}
                    </Button>
                  ))}
                </div>

                {/* Search Results */}
                <div className="space-y-2">
                  {searchResults.map((food) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-white font-medium">{food.nameUz}</h4>
                            {food.verified && (
                              <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Tasdiqlangan
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{food.nameRu}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-green-400 text-sm">{food.nutrition.calories} kcal</span>
                            <span className="text-blue-400 text-sm">{food.nutrition.protein}g oqsil</span>
                            {food.healthScore && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-yellow-400 text-sm">{food.healthScore}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFood(food)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Photo Tab */}
            <TabsContent value="photo" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-slate-800/90 rounded-lg p-8 border-2 border-dashed border-slate-600">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Rasm orqali aniqlash</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Ovqat rasmini yuklang va AI avtomatik aniqlaydi
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Camera className="w-4 h-4 mr-2" />
                    Rasm yuklash
                  </Button>
                </div>
                <p className="text-slate-500 text-xs">
                  * AI tahlil funksiyasi ishlab chiqish jarayonida
                </p>
              </div>
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-white font-medium">Qo'lda kiritish</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Mahsulot nomi</Label>
                    <Input
                      placeholder="Masalan: Uy pishgan non"
                      className="mt-2 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white">Kaloriya (100g)</Label>
                      <Input
                        type="number"
                        placeholder="250"
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Oqsil (g)</Label>
                      <Input
                        type="number"
                        placeholder="8"
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white">Uglevod (g)</Label>
                      <Input
                        type="number"
                        placeholder="45"
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Yog' (g)</Label>
                      <Input
                        type="number"
                        placeholder="3"
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Mahsulotni qo'shish
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Food Selection Dialog */}
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>{selectedFood?.nameUz}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedFood?.nameRu}
              </DialogDescription>
            </DialogHeader>

            {selectedFood && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Miqdor</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="number"
                      value={portion}
                      onChange={(e) => setPortion(Number(e.target.value))}
                      className="flex-1 bg-slate-800 border-slate-600 text-white"
                    />
                    <Select value={portionType} onValueChange={setPortionType}>
                      <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="grams">g</SelectItem>
                        {selectedFood.portionSizes.map((size) => (
                          <SelectItem key={size.name} value={size.name}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">Ozuqaviy qiymat</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kaloriya:</span>
                      <span className="text-green-400">{Math.round(selectedFood.nutrition.calories * portion / 100)} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Oqsil:</span>
                      <span className="text-blue-400">{(selectedFood.nutrition.protein * portion / 100).toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uglevod:</span>
                      <span className="text-orange-400">{(selectedFood.nutrition.carbs * portion / 100).toFixed(1)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yog':</span>
                      <span className="text-yellow-400">{(selectedFood.nutrition.fat * portion / 100).toFixed(1)}g</span>
                    </div>
                  </div>
                </div>

                {showAdvancedOptions && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white">Izoh</Label>
                      <Textarea
                        placeholder="Tayyorlash usuli, ta'm va boshqalar..."
                        value={mealNotes}
                        onChange={(e) => setMealNotes(e.target.value)}
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFood(null)}>
                Bekor qilish
              </Button>
              <Button onClick={addFoodToMeal} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Qo'shish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}