/**
 * Enhanced Add Meal Page
 * Professional food database with Russian and Uzbek foods
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Camera, Scan, Clock, Utensils, Star, History,
  Plus, Minus, ArrowLeft, CheckCircle, TrendingUp,
  Filter, Grid, List, BookOpen, Globe, Award,
  Zap, Heart, Target, Calculator, Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
} from '@/components/ui/dialog';
import { useTelegram } from '@/hooks/use-telegram';
import FoodDatabaseService, { FoodItem, FoodCategory, NutritionInfo } from '@/services/food-database-service';
import TelegramUserService, { MealEntry } from '@/services/telegram-user-service';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type SearchMode = 'all' | 'uzbek' | 'russian' | 'favorites';
type ViewMode = 'grid' | 'list';

interface SelectedFood {
  food: FoodItem;
  portion: number;
  notes?: string;
  customName?: string;
}

export default function EnhancedAddMeal() {
  const navigate = useNavigate();
  const { user: telegramUser, hapticFeedback, showAlert, cloudStorage } = useTelegram();
  
  // Services
  const [foodService] = useState(() => FoodDatabaseService.getInstance());
  const [userService] = useState(() => TelegramUserService.getInstance(cloudStorage));

  // Core states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | ''>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mealType, setMealType] = useState<MealType>('lunch');

  // Food data
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([]);

  // Selection states
  const [selectedFood, setSelectedFood] = useState<SelectedFood | null>(null);
  const [showNutritionDialog, setShowNutritionDialog] = useState(false);
  const [showCustomFoodDialog, setShowCustomFoodDialog] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  const telegramId = telegramUser?.id?.toString() || 'demo_user';

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Search foods when query or filters change
  useEffect(() => {
    searchFoods();
  }, [searchQuery, selectedCategory, searchMode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load popular foods
      const popular = foodService.getPopularFoods(20);
      setPopularFoods(popular);
      
      // Load categories
      const cats = foodService.getCategories();
      setCategories(cats);
      
      // Load recent meals
      const today = new Date().toISOString().split('T')[0];
      const recent = await userService.getMealsForDate(today);
      setRecentMeals(recent);
      
      // Set initial search results to popular foods
      setSearchResults(popular);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = () => {
    try {
      let results: FoodItem[] = [];

      if (!searchQuery.trim()) {
        // No search query - show popular or filtered foods
        if (selectedCategory) {
          results = foodService.getFoodsByCategory(selectedCategory);
        } else {
          results = popularFoods;
        }
      } else {
        // Search with query
        results = foodService.searchFoods(searchQuery, 50);
      }

      // Apply search mode filter
      if (searchMode === 'uzbek') {
        results = results.filter(food => food.region === 'uzbek');
      } else if (searchMode === 'russian') {
        results = results.filter(food => food.region === 'russian');
      }

      // Apply category filter
      if (selectedCategory) {
        results = results.filter(food => food.category === selectedCategory);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };

  const handleFoodSelect = (food: FoodItem, portion: number = 100) => {
    hapticFeedback.selection();
    setSelectedFood({
      food,
      portion,
      notes: '',
      customName: ''
    });
    setShowNutritionDialog(true);
  };

  const calculateNutrition = (food: FoodItem, grams: number): NutritionInfo => {
    return foodService.calculateNutritionForPortion(food, grams);
  };

  const saveMeal = async () => {
    if (!selectedFood) return;

    try {
      setSaving(true);
      hapticFeedback.impact('medium');

      const nutrition = calculateNutrition(selectedFood.food, selectedFood.portion);
      
      const meal: Omit<MealEntry, 'id'> = {
        type: mealType,
        name: selectedFood.customName || selectedFood.food.nameUz,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        timestamp: new Date().toISOString(),
        portion: selectedFood.portion,
        notes: selectedFood.notes || notes.trim() || undefined
      };

      const mealId = await userService.saveMeal(meal as MealEntry);
      
      hapticFeedback.notification('success');
      showAlert(`✅ ${meal.name} qo'shildi! (${meal.calories} kal)`);
      
      // Navigate back or show success
      navigate('/');
      
    } catch (error) {
      console.error('Error saving meal:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  const getMealTypeIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
    }
  };

  const getMealTypeName = (type: MealType) => {
    switch (type) {
      case 'breakfast': return 'Nonushta';
      case 'lunch': return 'Tushlik';
      case 'dinner': return 'Kechki ovqat';
      case 'snack': return 'Gazak';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30">
      <div className="container-mobile min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Ovqat qo'shish</h1>
                <p className="text-sm text-muted-foreground">
                  Rus va o'zbek taomlarini qidiring
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div className="flex space-x-2 mb-4">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <Button
                key={type}
                variant={mealType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMealType(type);
                  hapticFeedback.selection();
                }}
                className="flex-1"
              >
                <span className="mr-1">{getMealTypeIcon(type)}</span>
                {getMealTypeName(type)}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Taom nomi yozing... (masalan: palov, borsh)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 focus-professional"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4">
          <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as SearchMode)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Barchasi</TabsTrigger>
              <TabsTrigger value="uzbek">🇺🇿 O'zbek</TabsTrigger>
              <TabsTrigger value="russian">🇷🇺 Rus</TabsTrigger>
              <TabsTrigger value="favorites">⭐ Sevimli</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Categories */}
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <Badge
                variant={selectedCategory === '' ? 'default' : 'secondary'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory('')}
              >
                Barchasi
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'secondary'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.nameUz}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}`}>
              {searchResults.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  viewMode={viewMode}
                  onSelect={handleFoodSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Taom topilmadi</p>
              <p className="text-xs text-muted-foreground mt-1">
                Boshqa kalit so'zlar bilan qidiring
              </p>
            </div>
          )}
        </div>

        {/* Nutrition Dialog */}
        <Dialog open={showNutritionDialog} onOpenChange={setShowNutritionDialog}>
          <DialogContent className="w-full max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Ovqat tafsilotlari</DialogTitle>
              <DialogDescription>
                Porsiya hajmini sozlang va saqlang
              </DialogDescription>
            </DialogHeader>
            
            {selectedFood && (
              <NutritionDetails
                selectedFood={selectedFood}
                onChange={setSelectedFood}
                onSave={saveMeal}
                onCancel={() => setShowNutritionDialog(false)}
                saving={saving}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// === HELPER COMPONENTS === //

const FoodCard: React.FC<{
  food: FoodItem;
  viewMode: ViewMode;
  onSelect: (food: FoodItem) => void;
}> = ({ food, viewMode, onSelect }) => {
  const getRegionFlag = (region?: string) => {
    switch (region) {
      case 'uzbek': return '🇺🇿';
      case 'russian': return '🇷🇺';
      default: return '🌍';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="theme-card-interactive cursor-pointer"
        onClick={() => onSelect(food)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground text-sm">{food.nameUz}</h3>
                <span className="text-xs">{getRegionFlag(food.region)}</span>
                {food.isTraditional && <Star className="w-3 h-3 text-yellow-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{food.nameRu}</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {food.nutritionPer100g.calories} kal/100г
                </span>
                <span className="text-xs text-muted-foreground">
                  Б: {food.nutritionPer100g.protein}г
                </span>
              </div>
            </div>
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="theme-card-interactive cursor-pointer"
      onClick={() => onSelect(food)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getRegionFlag(food.region)}</span>
            {food.isTraditional && <Star className="w-4 h-4 text-yellow-500" />}
            {food.isPopular && <TrendingUp className="w-4 h-4 text-primary" />}
          </div>
          <Badge variant="secondary" className="text-xs">
            {food.nutritionPer100g.calories} kal
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{food.nameUz}</h3>
          <p className="text-sm text-muted-foreground">{food.nameRu}</p>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-blue-600">{food.nutritionPer100g.protein}г</div>
              <div className="text-muted-foreground">Oqsil</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">{food.nutritionPer100g.carbs}г</div>
              <div className="text-muted-foreground">Uglevod</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">{food.nutritionPer100g.fat}г</div>
              <div className="text-muted-foreground">Yog'</div>
            </div>
          </div>
        </div>

        {food.commonPortions && food.commonPortions.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium">Porsiya:</span> {food.commonPortions[0].nameUz}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const NutritionDetails: React.FC<{
  selectedFood: SelectedFood;
  onChange: (food: SelectedFood) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ selectedFood, onChange, onSave, onCancel, saving }) => {
  const foodService = FoodDatabaseService.getInstance();
  const nutrition = foodService.calculateNutritionForPortion(selectedFood.food, selectedFood.portion);

  return (
    <div className="space-y-6">
      {/* Food Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{selectedFood.food.nameUz}</h3>
        <p className="text-sm text-muted-foreground">{selectedFood.food.nameRu}</p>
      </div>

      {/* Portion Control */}
      <div className="space-y-4">
        <div>
          <Label>Porsiya hajmi (gram)</Label>
          <div className="flex items-center space-x-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({
                ...selectedFood,
                portion: Math.max(10, selectedFood.portion - 10)
              })}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <Input
              type="number"
              value={selectedFood.portion}
              onChange={(e) => onChange({
                ...selectedFood,
                portion: parseInt(e.target.value) || 100
              })}
              className="text-center flex-1"
              min="1"
              max="2000"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({
                ...selectedFood,
                portion: selectedFood.portion + 10
              })}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Common Portions */}
        {selectedFood.food.commonPortions && selectedFood.food.commonPortions.length > 0 && (
          <div>
            <Label>Tez tanlash</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFood.food.commonPortions.map((portion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({
                    ...selectedFood,
                    portion: portion.grams
                  })}
                  className="text-xs"
                >
                  {portion.nameUz} ({portion.grams}г)
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nutrition Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Ozuqaviy qiymat</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Kaloriya:</span>
              <span className="font-medium">{nutrition.calories} kal</span>
            </div>
            <div className="flex justify-between">
              <span>Oqsil:</span>
              <span className="font-medium">{nutrition.protein}г</span>
            </div>
            <div className="flex justify-between">
              <span>Uglevodlar:</span>
              <span className="font-medium">{nutrition.carbs}г</span>
            </div>
            <div className="flex justify-between">
              <span>Yog'lar:</span>
              <span className="font-medium">{nutrition.fat}г</span>
            </div>
            <div className="flex justify-between">
              <span>Tola:</span>
              <span className="font-medium">{nutrition.fiber}г</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div>
        <Label>Izoh (ixtiyoriy)</Label>
        <Textarea
          placeholder="Qo'shimcha ma'lumot..."
          value={selectedFood.notes || ''}
          onChange={(e) => onChange({
            ...selectedFood,
            notes: e.target.value
          })}
          className="mt-2"
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving} className="flex-1">
          Bekor qilish
        </Button>
        <Button onClick={onSave} disabled={saving} className="flex-1">
          {saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
        </Button>
      </div>
    </div>
  );
};