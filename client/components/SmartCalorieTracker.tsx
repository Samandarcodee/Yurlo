import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  Search,
  Plus,
  Minus,
  Clock,
  Flame,
  Utensils,
  Apple,
  Coffee,
  ChefHat,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Brain,
  Sparkles,
  Heart,
  Activity,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";

// === INTERFACES ===
interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portion: number;
  unit: string;
  image?: string;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Food[];
  timestamp: Date;
  totalCalories: number;
  notes?: string;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface CalorieAnalysis {
  consumed: number;
  burned: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'optimal' | 'over';
  recommendation: string;
}

// === MOCK DATA ===
const POPULAR_FOODS = [
  {
    id: '1',
    name: 'Non',
    calories: 275,
    protein: 9,
    carbs: 55,
    fat: 1.5,
    fiber: 3,
    category: 'breakfast' as const,
    portion: 100,
    unit: 'g',
    image: '🍞'
  },
  {
    id: '2',
    name: 'Osh',
    calories: 380,
    protein: 15,
    carbs: 58,
    fat: 12,
    fiber: 2,
    category: 'lunch' as const,
    portion: 200,
    unit: 'g',
    image: '🍚'
  },
  {
    id: '3',
    name: 'Tuxum',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    category: 'breakfast' as const,
    portion: 100,
    unit: 'g',
    image: '🥚'
  },
  {
    id: '4',
    name: 'Alma',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    category: 'snack' as const,
    portion: 100,
    unit: 'g',
    image: '🍎'
  },
  {
    id: '5',
    name: 'Choy',
    calories: 2,
    protein: 0.1,
    carbs: 0.5,
    fat: 0,
    fiber: 0,
    category: 'breakfast' as const,
    portion: 250,
    unit: 'ml',
    image: '🍵'
  },
  {
    id: '6',
    name: 'Manti',
    calories: 235,
    protein: 12,
    carbs: 35,
    fat: 6,
    fiber: 2,
    category: 'dinner' as const,
    portion: 150,
    unit: 'g',
    image: '🥟'
  }
];

const AI_SUGGESTIONS = [
  {
    type: 'warning',
    message: 'Siz bugun 300 kaloriya kam iste\'mol qildingiz. Sog\'lom atıştırmalık qo\'shing.',
    action: 'Yong\'oq yoki meva qo\'shish'
  },
  {
    type: 'success',
    message: 'Ajoyib! Bugungi oqsil maqsadingizni 95% bajarib bo\'ldingiz.',
    action: 'Davom eting'
  },
  {
    type: 'info',
    message: 'Kechki ovqat uchun yengil salat tavsiya etamiz - qolgan kaloriyaga mos keladi.',
    action: 'Salat retseptlarini ko\'rish'
  }
];

// === UTILITY FUNCTIONS ===
const calculateMealCalories = (foods: Food[]): number => {
  return foods.reduce((total, food) => total + food.calories, 0);
};

const calculateNutritionTotals = (foods: Food[]) => {
  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat,
      fiber: totals.fiber + food.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};

const getCalorieStatus = (consumed: number, target: number): CalorieAnalysis => {
  const percentage = (consumed / target) * 100;
  const remaining = target - consumed;
  
  let status: 'under' | 'optimal' | 'over';
  let recommendation: string;
  
  if (percentage < 80) {
    status = 'under';
    recommendation = 'Ko\'proq ovqat iste\'mol qiling. Sog\'lom atıştırmalık qo\'shing.';
  } else if (percentage <= 110) {
    status = 'optimal';
    recommendation = 'Ajoyib! Maqsadga yaqinsiz. Davom eting.';
  } else {
    status = 'over';
    recommendation = 'Maqsaddan oshib ketdingiz. Ertaga ko\'proq faol bo\'ling.';
  }
  
  return {
    consumed,
    burned: 0, // This would come from activity tracking
    remaining,
    percentage,
    status,
    recommendation
  };
};

// === COMPONENTS ===
interface FoodCardProps {
  food: Food;
  onAdd: (food: Food) => void;
  onQuickAdd?: (food: Food) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onAdd, onQuickAdd }) => {
  const [portion, setPortion] = useState(food.portion);
  
  const adjustedFood = useMemo(() => ({
    ...food,
    calories: Math.round((food.calories * portion) / food.portion),
    protein: Math.round((food.protein * portion) / food.portion),
    carbs: Math.round((food.carbs * portion) / food.portion),
    fat: Math.round((food.fat * portion) / food.portion),
    fiber: Math.round((food.fiber * portion) / food.portion),
    portion,
  }), [food, portion]);

  return (
    <Card className="glass-light hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{food.image}</div>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium">{food.name}</h4>
              <p className="text-sm text-muted-foreground">
                {adjustedFood.calories} kal • {portion}{food.unit}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Miqdor:</Label>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPortion(Math.max(10, portion - 10))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={portion}
                  onChange={(e) => setPortion(Number(e.target.value))}
                  className="w-16 h-8 text-center text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPortion(portion + 10)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <p className="font-medium text-green-600">{adjustedFood.protein}g</p>
                <p className="text-muted-foreground">Oqsil</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-600">{adjustedFood.carbs}g</p>
                <p className="text-muted-foreground">Uglevod</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-yellow-600">{adjustedFood.fat}g</p>
                <p className="text-muted-foreground">Yog'</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-purple-600">{adjustedFood.fiber}g</p>
                <p className="text-muted-foreground">Tola</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => onAdd(adjustedFood)}
                className="flex-1 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Qo'shish
              </Button>
              {onQuickAdd && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuickAdd(adjustedFood)}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface NutritionProgressProps {
  current: number;
  target: number;
  label: string;
  color: string;
  unit?: string;
}

const NutritionProgress: React.FC<NutritionProgressProps> = ({
  current,
  target,
  label,
  color,
  unit = 'g'
}) => {
  const percentage = Math.min(100, (current / target) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-muted-foreground">
          {current.toFixed(1)}{unit} / {target}{unit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground text-center">
        {percentage.toFixed(0)}% of goal
      </p>
    </div>
  );
};

// === MAIN COMPONENT ===
export default function SmartCalorieTracker() {
  const { user } = useUser();
  const { hapticFeedback } = useTelegram();
  
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [notes, setNotes] = useState("");

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const allFoods = todaysMeals.flatMap(meal => meal.foods);
    return calculateNutritionTotals(allFoods);
  }, [todaysMeals]);

  // Nutrition goals based on user profile
  const nutritionGoals: NutritionGoals = useMemo(() => {
    const dailyCalories = user?.dailyCalories || 2200;
    return {
      calories: dailyCalories,
      protein: Math.round(dailyCalories * 0.15 / 4), // 15% of calories from protein
      carbs: Math.round(dailyCalories * 0.50 / 4),   // 50% of calories from carbs
      fat: Math.round(dailyCalories * 0.35 / 9),     // 35% of calories from fat
      fiber: 25, // Recommended daily fiber intake
    };
  }, [user]);

  // Calorie analysis
  const calorieAnalysis = useMemo(() => 
    getCalorieStatus(dailyTotals.calories, nutritionGoals.calories), 
    [dailyTotals.calories, nutritionGoals.calories]
  );

  // Filter foods based on search
  const filteredFoods = useMemo(() => {
    return POPULAR_FOODS.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category === selectedMealType
    );
  }, [searchTerm, selectedMealType]);

  // Handle adding food to a meal
  const addFoodToMeal = useCallback((food: Food, mealType?: string) => {
    hapticFeedback.impact("light");
    
    const targetMealType = (mealType as any) || selectedMealType;
    const existingMealIndex = todaysMeals.findIndex(meal => meal.type === targetMealType);
    
    if (existingMealIndex >= 0) {
      // Add to existing meal
      const updatedMeals = [...todaysMeals];
      updatedMeals[existingMealIndex].foods.push(food);
      updatedMeals[existingMealIndex].totalCalories = calculateMealCalories(updatedMeals[existingMealIndex].foods);
      setTodaysMeals(updatedMeals);
    } else {
      // Create new meal
      const newMeal: Meal = {
        id: Date.now().toString(),
        type: targetMealType,
        foods: [food],
        timestamp: new Date(),
        totalCalories: food.calories,
        notes
      };
      setTodaysMeals([...todaysMeals, newMeal]);
    }
    
    setNotes("");
  }, [selectedMealType, todaysMeals, notes, hapticFeedback]);

  // Handle quick add with default portion
  const quickAddFood = useCallback((food: Food) => {
    hapticFeedback.selection();
    addFoodToMeal(food);
  }, [addFoodToMeal, hapticFeedback]);

  // Remove food from meal
  const removeFoodFromMeal = useCallback((mealId: string, foodId: string) => {
    hapticFeedback.impact("light");
    
    const updatedMeals = todaysMeals.map(meal => {
      if (meal.id === mealId) {
        const updatedFoods = meal.foods.filter(food => food.id !== foodId);
        return {
          ...meal,
          foods: updatedFoods,
          totalCalories: calculateMealCalories(updatedFoods)
        };
      }
      return meal;
    }).filter(meal => meal.foods.length > 0); // Remove empty meals
    
    setTodaysMeals(updatedMeals);
  }, [todaysMeals, hapticFeedback]);

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Utensils className="w-5 h-5" />;
      case 'dinner': return <ChefHat className="w-5 h-5" />;
      case 'snack': return <Apple className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  const getMealLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Nonushta';
      case 'lunch': return 'Tushlik';
      case 'dinner': return 'Kechki ovqat';
      case 'snack': return 'Atıştırmalık';
      default: return 'Ovqat';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mint-600 to-water-600 bg-clip-text text-transparent">
            Smart Calorie Tracker
          </h1>
          <p className="text-muted-foreground">AI yordamida aqlli ovqat kuzatuvi</p>
        </div>

        {/* Daily Overview */}
        <Card className="glass-medium card-shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Bugungi Ko'rsatkichlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Calorie Progress */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={calorieAnalysis.status === 'optimal' ? '#22C55E' : 
                               calorieAnalysis.status === 'under' ? '#F59E0B' : '#EF4444'}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(calorieAnalysis.percentage / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold">{dailyTotals.calories}</div>
                        <div className="text-xs text-muted-foreground">kal</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">Kaloriya</p>
                  <p className="text-xs text-muted-foreground">
                    {calorieAnalysis.remaining > 0 ? `${calorieAnalysis.remaining} qoldi` : 'Maqsad bajarildi'}
                  </p>
                </div>
              </div>

              {/* Nutrition Breakdown */}
              <div className="space-y-3">
                <NutritionProgress
                  current={dailyTotals.protein}
                  target={nutritionGoals.protein}
                  label="Oqsil"
                  color="green"
                />
                <NutritionProgress
                  current={dailyTotals.carbs}
                  target={nutritionGoals.carbs}
                  label="Uglevod"
                  color="blue"
                />
              </div>

              <div className="space-y-3">
                <NutritionProgress
                  current={dailyTotals.fat}
                  target={nutritionGoals.fat}
                  label="Yog'"
                  color="yellow"
                />
                <NutritionProgress
                  current={dailyTotals.fiber}
                  target={nutritionGoals.fiber}
                  label="Tola"
                  color="purple"
                />
              </div>

              {/* AI Recommendations */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Tavsiyalar</span>
                </h4>
                {AI_SUGGESTIONS.slice(0, 2).map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl text-xs ${
                      suggestion.type === 'success' ? 'bg-success-50 border border-success-200' :
                      suggestion.type === 'warning' ? 'bg-warning-50 border border-warning-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {suggestion.type === 'success' ? <CheckCircle className="w-4 h-4 text-success-600 mt-0.5" /> :
                       suggestion.type === 'warning' ? <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5" /> :
                       <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />}
                      <div>
                        <p className="font-medium">{suggestion.message}</p>
                        <p className="text-muted-foreground mt-1">{suggestion.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Food Search & Add */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Photo Analysis */}
            <Card className="glass-light">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Ovqat Qidirish</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Ovqat nomi kiriting..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPhotoAnalysis(true)}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Rasm</span>
                  </Button>
                </div>

                <Tabs value={selectedMealType} onValueChange={(value: any) => setSelectedMealType(value)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="breakfast" className="text-xs">Nonushta</TabsTrigger>
                    <TabsTrigger value="lunch" className="text-xs">Tushlik</TabsTrigger>
                    <TabsTrigger value="dinner" className="text-xs">Kechki</TabsTrigger>
                    <TabsTrigger value="snack" className="text-xs">Atıştır.</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label className="text-sm">Izoh (ixtiyoriy)</Label>
                  <Textarea
                    placeholder="Ovqat haqida qo'shimcha ma'lumot..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-20 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Food List */}
            <Card className="glass-light">
              <CardHeader>
                <CardTitle>Mashhur Ovqatlar</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onAdd={addFoodToMeal}
                        onQuickAdd={quickAddFood}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Today's Meals */}
          <div className="space-y-6">
            <Card className="glass-light">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Bugungi Ovqatlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                      const meal = todaysMeals.find(m => m.type === mealType);
                      
                      return (
                        <div key={mealType} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getMealIcon(mealType)}
                              <span className="font-medium text-sm">
                                {getMealLabel(mealType)}
                              </span>
                            </div>
                            {meal && (
                              <Badge variant="secondary" className="text-xs">
                                {meal.totalCalories} kal
                              </Badge>
                            )}
                          </div>
                          
                          {meal ? (
                            <div className="space-y-2 pl-6">
                              {meal.foods.map((food) => (
                                <div
                                  key={`${meal.id}-${food.id}`}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">{food.image}</span>
                                    <div>
                                      <p className="text-sm font-medium">{food.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {food.portion}{food.unit} • {food.calories} kal
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFoodFromMeal(meal.id, food.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              {meal.notes && (
                                <p className="text-xs text-muted-foreground italic pl-2">
                                  "{meal.notes}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground pl-6">
                              Hali ovqat qo'shilmagan
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-light">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Tezkor Statistika</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ovqat soni:</span>
                  <Badge variant="outline">{todaysMeals.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eng ko'p kal:</span>
                  <span className="text-sm font-medium">
                    {todaysMeals.length > 0 
                      ? Math.max(...todaysMeals.map(m => m.totalCalories)) 
                      : 0} kal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">O'rtacha ovqat:</span>
                  <span className="text-sm font-medium">
                    {todaysMeals.length > 0 
                      ? Math.round(dailyTotals.calories / todaysMeals.length)
                      : 0} kal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maqsad %:</span>
                  <Badge variant={calorieAnalysis.status === 'optimal' ? 'default' : 'secondary'}>
                    {calorieAnalysis.percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}