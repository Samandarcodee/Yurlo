import React, { useState, useEffect, useMemo } from "react";
import {
  Camera,
  Search,
  Clock,
  Utensils,
  Zap,
  CheckCircle,
  Star,
  History,
  Flame,
  Plus,
  Minus,
  Edit3,
  TrendingUp,
  ArrowLeft,
  Scan,
  ChefHat,
  Timer,
  Target,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import {
  updateTodayTracking,
  getTodayTracking,
  calculateNutritionGoals,
  type Meal,
} from "@/utils/tracking";
import {
  searchFoods,
  getPopularFoods,
  getFoodsByCategory,
  getRecentMeals,
  calculateNutrition,
  simulateAIRecognition,
  getNutritionScore,
  FOOD_CATEGORIES,
  QUICK_ADD_PRESETS,
  type FoodItem,
} from "@/utils/foodDatabase";

type AddMode = "quick" | "search" | "photo" | "manual";
type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface SelectedFood {
  food: FoodItem;
  portion: number;
  customName?: string;
  notes?: string;
}

export default function AddMeal() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();

  // Basic states
  const [addMode, setAddMode] = useState<AddMode>("quick");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealTime, setMealTime] = useState<MealType>("lunch");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Selected food states
  const [selectedFood, setSelectedFood] = useState<SelectedFood | null>(null);
  const [customNutrition, setCustomNutrition] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null>(null);
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);

  // Data states
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [todayTracking, setTodayTracking] = useState<any>(null);
  const [nutritionGoals, setNutritionGoals] = useState<any>(null);

  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  // Load data on mount
  useEffect(() => {
    if (user) {
      setPopularFoods(getPopularFoods(8));
      setRecentMeals(getRecentMeals(telegramId, 5));
      setTodayTracking(getTodayTracking(telegramId));
      setNutritionGoals(calculateNutritionGoals(user));

      // Set default meal time based on current time
      const hour = new Date().getHours();
      if (hour < 11) setMealTime("breakfast");
      else if (hour < 16) setMealTime("lunch");
      else if (hour < 21) setMealTime("dinner");
      else setMealTime("snack");
    }
  }, [user, telegramId]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchFoods(searchQuery, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Calculate final nutrition
  const finalNutrition = useMemo(() => {
    if (!selectedFood) return null;

    if (customNutrition) {
      return customNutrition;
    }

    return calculateNutrition(selectedFood.food, selectedFood.portion);
  }, [selectedFood, customNutrition]);

  // Nutrition quality score
  const nutritionScore = useMemo(() => {
    if (!finalNutrition) return null;
    return getNutritionScore(finalNutrition);
  }, [finalNutrition]);

  // Handle image upload and AI recognition
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setSelectedImage(e.target?.result as string);
        setIsAnalyzing(true);
        setAddMode("photo");

        try {
          const result = await simulateAIRecognition(file.name);
          setSelectedFood({
            food: result.food,
            portion: result.portion,
          });
        } catch (error) {
          console.error("AI recognition error:", error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle food selection
  const handleFoodSelect = (food: FoodItem, portion: number = 1) => {
    setSelectedFood({
      food,
      portion,
    });
    setAddMode("manual");
    setCustomNutrition(null);
    setIsEditingNutrition(false);
  };

  // Handle recent meal selection
  const handleRecentMealSelect = (meal: Meal) => {
    // Find matching food or create a generic one
    const matchingFood = searchFoods(meal.name, 1)[0];

    if (matchingFood) {
      handleFoodSelect(matchingFood, 1);
    } else {
      // Create custom food entry
      const customFood: FoodItem = {
        id: `custom_${Date.now()}`,
        name: meal.name,
        nameUz: meal.name,
        category: "traditional",
        serving: { size: "1 porsiya", unit: "porsiya", grams: 200 },
        nutrition: {
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber || 2,
          sugar: 2,
          sodium: 300,
        },
        tags: ["custom", "recent"],
        isVerified: false,
        popularity: 50,
      };

      setSelectedFood({ food: customFood, portion: 1 });
      setAddMode("manual");
    }
  };

  // Handle portion change
  const updatePortion = (newPortion: number) => {
    if (selectedFood) {
      setSelectedFood({
        ...selectedFood,
        portion: Math.max(0.1, newPortion),
      });
    }
  };

  // Handle custom nutrition editing
  const handleNutritionEdit = (field: string, value: number) => {
    if (!finalNutrition) return;

    setCustomNutrition({
      ...finalNutrition,
      [field]: Math.max(0, value),
    });
  };

  // Save meal to tracking
  const saveMeal = async () => {
    if (!selectedFood || !finalNutrition || !user) return;

    setIsSaving(true);

    try {
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: selectedFood.customName || selectedFood.food.nameUz,
        calories: finalNutrition.calories,
        protein: finalNutrition.protein,
        carbs: finalNutrition.carbs,
        fat: finalNutrition.fat,
        fiber: finalNutrition.fiber,
        timestamp: new Date().toISOString(),
        type: mealTime,
        notes: notes.trim() || undefined,
      };

      // Get current tracking
      const currentTracking = getTodayTracking(telegramId);
      const updatedMeals = [...(currentTracking.meals || []), newMeal];

      // Calculate total calories consumed
      const totalCalories = updatedMeals.reduce(
        (sum, meal) => sum + meal.calories,
        0,
      );

      // Update tracking
      updateTodayTracking(telegramId, {
        meals: updatedMeals,
        caloriesConsumed: totalCalories,
      });

      // Push notify via Telegram (best-effort, respects user setting)
      try {
        const enabled = localStorage.getItem(`notif_meals_${telegramId}`);
        if (enabled === null || enabled === 'true') {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramId,
              template: 'meal_saved',
            }),
          });
        }
      } catch {}

      // Show success and navigate back
      alert(`✅ ${newMeal.name} qo'shildi! (${newMeal.calories} kal)`);
      navigate("/");
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick add preset
  const handleQuickAdd = (preset: (typeof QUICK_ADD_PRESETS)[0]) => {
    // For now, just select the first item of the preset
    const firstItem = preset.items[0];
    const food = popularFoods.find((f) => f.id === firstItem.foodId);
    if (food) {
      handleFoodSelect(food, firstItem.portion);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Enhanced Header with Theme Support */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary dark:via-primary/80 dark:to-primary/60 text-white p-6 pb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 dark:hover:bg-white/10 p-3 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold">Ovqat Qo'shish</h1>
              <p className="text-white/80 text-sm">Sog'liq kuzatuvi</p>
            </div>
            <div className="w-12"></div>
          </div>

          {/* Enhanced Today's Progress */}
          {todayTracking && nutritionGoals && (
            <div className="bg-white/15 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-sm text-white/90 font-medium">Bugungi jarayon</span>
                </div>
                <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                  {todayTracking.caloriesConsumed}/{nutritionGoals.calories} kal
                </span>
              </div>
              <div className="space-y-2">
                <Progress
                  value={
                    (todayTracking.caloriesConsumed / nutritionGoals.calories) *
                    100
                  }
                  className="h-3 bg-white/20"
                />
                <div className="flex justify-between text-xs text-white/80">
                  <span>{Math.round((todayTracking.caloriesConsumed / nutritionGoals.calories) * 100)}% bajarildi</span>
                  <span>{nutritionGoals.calories - todayTracking.caloriesConsumed} kal qoldi</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 pb-20 -mt-4">
          {/* Enhanced Add Mode Selector */}
          <Card className="mb-6 theme-card border-2 border-border/30 dark:border-border/20 shadow-lg dark:shadow-xl">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-2 text-primary" />
                Qo'shish usuli
              </h2>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setAddMode("quick")}
                  className={`group p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                    addMode === "quick"
                      ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-600 shadow-lg"
                      : "bg-muted/50 dark:bg-muted/30 text-muted-foreground hover:bg-muted dark:hover:bg-muted/50 hover:text-foreground border border-border/20"
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 p-1 rounded-lg ${
                    addMode === "quick" ? "bg-green-200 dark:bg-green-800" : "bg-muted"
                  }`}>
                    <Timer className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Tezkor</span>
                </button>

                <button
                  onClick={() => setAddMode("search")}
                  className={`group p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                    addMode === "search"
                      ? "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600 shadow-lg"
                      : "bg-muted/50 dark:bg-muted/30 text-muted-foreground hover:bg-muted dark:hover:bg-muted/50 hover:text-foreground border border-border/20"
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 p-1 rounded-lg ${
                    addMode === "search" ? "bg-blue-200 dark:bg-blue-800" : "bg-muted"
                  }`}>
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Qidirish</span>
                </button>

                <label className="cursor-pointer group">
                  <div
                    className={`p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                      addMode === "photo"
                        ? "bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600 shadow-lg"
                        : "bg-muted/50 dark:bg-muted/30 text-muted-foreground hover:bg-muted dark:hover:bg-muted/50 hover:text-foreground border border-border/20"
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 p-1 rounded-lg ${
                      addMode === "photo" ? "bg-purple-200 dark:bg-purple-800" : "bg-muted"
                    }`}>
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium">Rasm</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                <button
                  onClick={() => setAddMode("manual")}
                  className={`p-3 rounded-xl text-center transition-all ${
                    addMode === "manual"
                      ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Edit3 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Qo'lda</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add Mode */}
          {addMode === "quick" && (
            <div className="space-y-4">
              {/* Recent Meals */}
              {recentMeals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <History className="w-5 h-5 mr-2" />
                      So'nggi ovqatlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentMeals.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleRecentMealSelect(meal)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {meal.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {meal.calories} kal
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Add Presets */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Zap className="w-5 h-5 mr-2" />
                    Tezkor qo'shish
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {QUICK_ADD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleQuickAdd(preset)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{preset.icon}</span>
                        <span className="font-medium text-gray-900">
                          {preset.name}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Foods */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Star className="w-5 h-5 mr-2" />
                    Mashhur ovqatlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {popularFoods.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => handleFoodSelect(food)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {food.nameUz}
                        </div>
                        <div className="text-xs text-gray-500">
                          {food.nutrition.calories} kal
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Mode */}
          {addMode === "search" && (
            <div className="space-y-4">
              {/* Search Input */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Ovqat nomini kiriting..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {!searchQuery && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Kategoriyalar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.values(FOOD_CATEGORIES).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                        >
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <div className="text-xs font-medium text-gray-700">
                            {category.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Qidiruv natijalari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => handleFoodSelect(food)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {food.nameUz}
                          </div>
                          <div className="text-sm text-gray-500">
                            {food.nutrition.calories} kal • {food.serving.size}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Category Results */}
              {selectedCategory && !searchQuery && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {
                        FOOD_CATEGORIES[
                          selectedCategory as keyof typeof FOOD_CATEGORIES
                        ]?.name
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getFoodsByCategory(selectedCategory)
                      .slice(0, 10)
                      .map((food) => (
                        <button
                          key={food.id}
                          onClick={() => handleFoodSelect(food)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="text-left">
                            <div className="font-medium text-gray-900">
                              {food.nameUz}
                            </div>
                            <div className="text-sm text-gray-500">
                              {food.nutrition.calories} kal •{" "}
                              {food.serving.size}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Photo Mode */}
          {addMode === "photo" && (
            <div className="space-y-4">
              {selectedImage && (
                <Card>
                  <CardContent className="p-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Ovqat"
                        className="w-full h-48 object-cover"
                      />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin mb-2">
                              <Zap className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-sm">AI tahlil qilmoqda...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Selected Food Details */}
          {selectedFood && finalNutrition && (
            <div className="space-y-4">
              {/* Food Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedFood.food.nameUz}</span>
                    {nutritionScore && (
                      <Badge
                        variant={
                          nutritionScore.score >= 80
                            ? "default"
                            : nutritionScore.score >= 60
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {nutritionScore.grade} ({nutritionScore.score})
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Portion Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Porsiya miqdori</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updatePortion(selectedFood.portion - 0.25)
                          }
                          disabled={selectedFood.portion <= 0.25}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="min-w-16 text-center font-semibold">
                          {selectedFood.portion}x
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updatePortion(selectedFood.portion + 0.25)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <Slider
                      value={[selectedFood.portion]}
                      onValueChange={(value) => updatePortion(value[0])}
                      min={0.25}
                      max={3}
                      step={0.25}
                      className="w-full"
                    />
                  </div>

                  {/* Nutrition Display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-700">
                        {finalNutrition.calories}
                      </div>
                      <div className="text-xs text-red-600">Kaloriya</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {finalNutrition.protein}g
                      </div>
                      <div className="text-xs text-blue-600">Oqsil</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {finalNutrition.carbs}g
                      </div>
                      <div className="text-xs text-yellow-600">Uglevodlar</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {finalNutrition.fat}g
                      </div>
                      <div className="text-xs text-green-600">Yog'</div>
                    </div>
                  </div>

                  {/* Edit Nutrition Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNutrition(!isEditingNutrition)}
                    className="w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Ozuqa qiymatlarini tahrirlash
                  </Button>

                  {/* Custom Nutrition Edit */}
                  {isEditingNutrition && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      {["calories", "protein", "carbs", "fat", "fiber"].map(
                        (field) => (
                          <div
                            key={field}
                            className="flex items-center justify-between"
                          >
                            <Label className="capitalize">
                              {field === "calories"
                                ? "Kaloriya"
                                : field === "protein"
                                  ? "Oqsil"
                                  : field === "carbs"
                                    ? "Uglevodlar"
                                    : field === "fat"
                                      ? "Yog'"
                                      : "Tola"}
                            </Label>
                            <Input
                              type="number"
                              value={
                                customNutrition?.[
                                  field as keyof typeof customNutrition
                                ] ||
                                finalNutrition[
                                  field as keyof typeof finalNutrition
                                ]
                              }
                              onChange={(e) =>
                                handleNutritionEdit(
                                  field,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-20 text-center"
                              min="0"
                              step={field === "calories" ? "1" : "0.1"}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Nutrition Quality Feedback */}
                  {nutritionScore && nutritionScore.feedback.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Ozuqa sifati baholovi:
                      </Label>
                      <div className="space-y-1">
                        {nutritionScore.feedback.map((feedback, index) => (
                          <div
                            key={index}
                            className="text-xs text-gray-600 flex items-center"
                          >
                            <span>{feedback}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meal Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ovqat tafsilotlari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Name */}
                  <div>
                    <Label htmlFor="custom-name">Ovqat nomi (ixtiyoriy)</Label>
                    <Input
                      id="custom-name"
                      placeholder={selectedFood.food.nameUz}
                      value={selectedFood.customName || ""}
                      onChange={(e) =>
                        setSelectedFood({
                          ...selectedFood,
                          customName: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Meal Time */}
                  <div>
                    <Label>Ovqat vaqti</Label>
                    <Select
                      value={mealTime}
                      onValueChange={(value: MealType) => setMealTime(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">🌅 Nonushta</SelectItem>
                        <SelectItem value="lunch">☀️ Tushlik</SelectItem>
                        <SelectItem value="dinner">🌙 Kechki ovqat</SelectItem>
                        <SelectItem value="snack">🍎 Gazak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Izohlar (ixtiyoriy)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ovqat haqida qo'shimcha ma'lumot..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 h-20 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="sticky bottom-4">
                <Button
                  onClick={saveMeal}
                  disabled={isSaving}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5 mr-2" />
                      Ovqatni Saqlash ({finalNutrition.calories} kal)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
