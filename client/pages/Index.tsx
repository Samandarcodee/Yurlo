import {
  Plus,
  Droplets,
  Activity,
  Target,
  TrendingUp,
  Calendar,
  Footprints,
  Moon,
  Dumbbell,
  Brain,
  Flame,
  Apple,
  Clock,
  MoreHorizontal,
  Bell,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import { useI18n } from "@/contexts/I18nContext";
import { useMemo, useEffect, useState } from "react";
import {
  getTodayTracking,
  getWeeklyStats,
  calculateNutritionGoals,
  addSampleData,
  updateTodayTracking,
} from "@/utils/tracking";
import {
  getTodaySteps,
  addSteps,
  getStepGoals,
  addSampleStepData,
  checkAchievements,
} from "@/utils/stepTracking";
import {
  getTodayWater,
  addWaterEntry,
  getWaterGoals,
  addSampleWaterData,
  calculateWaterGoal,
} from "@/utils/waterTracking";
import {
  getWeeklyWorkoutSummary,
  addSampleWorkoutData,
  logQuickWorkout,
} from "@/utils/workoutTracking";
import type { DailyTracking, WeeklyStats } from "@/utils/tracking";

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 200,
  strokeWidth = 16,
  color = "#6366F1",
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function Index() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();
  const { t } = useI18n();
  const [todayTracking, setTodayTracking] = useState<DailyTracking | null>(
    null,
  );
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [todaySteps, setTodaySteps] = useState<any>(null);
  const [stepGoals, setStepGoals] = useState<any>(null);
  const [todayWater, setTodayWater] = useState<any>(null);
  const [waterGoals, setWaterGoals] = useState<any>(null);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Get telegram ID for data storage
  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  // Optimized data loading - only once on startup
  useEffect(() => {
    if (hasLoadedData || !user) return;

    const loadAllData = async () => {
      setIsLoading(true);

      try {
        console.log("Loading user data for:", telegramId);

        // Get today's tracking data
        const tracking = getTodayTracking(telegramId);

        // Add sample data if this is first time (for demo purposes)
        if (tracking.caloriesConsumed === 0) {
          addSampleData(telegramId, user);
          const updatedTracking = getTodayTracking(telegramId);
          setTodayTracking(updatedTracking);
        } else {
          setTodayTracking(tracking);
        }

        // Get weekly statistics
        const weekly = getWeeklyStats(telegramId);
        setWeeklyStats(weekly);

        // Load step tracking data
        addSampleStepData(
          telegramId,
          parseFloat(user.height),
          parseFloat(user.weight),
        );
        const steps = getTodaySteps(telegramId);
        const stepGoals = getStepGoals(telegramId);
        setTodaySteps(steps);
        setStepGoals(stepGoals);

        // Load water tracking data
        const waterGoal = calculateWaterGoal(user);
        addSampleWaterData(telegramId, waterGoal);
        const water = getTodayWater(telegramId);
        const waterGoals = getWaterGoals(telegramId);
        setTodayWater(water);
        setWaterGoals(waterGoals);

        // Load workout data
        addSampleWorkoutData(telegramId, parseFloat(user.weight));
        const workouts = getWeeklyWorkoutSummary(telegramId);
        setWeeklyWorkouts(workouts);

        // Check for step achievements
        checkAchievements(telegramId);

        setHasLoadedData(true);
        console.log("All data loaded successfully");
      } catch (error) {
        console.error("Error loading tracking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [user, telegramId, hasLoadedData]);

  // Calculate nutrition goals based on user profile
  const nutritionGoals = useMemo(() => {
    if (!user) return null;
    return calculateNutritionGoals(user);
  }, [user]);

  // Calculate nutrition percentages from today's meals
  const nutritionBreakdown = useMemo(() => {
    if (!todayTracking?.meals || todayTracking.meals.length === 0) {
      return { protein: 28, fat: 35, carbs: 37 }; // Default values
    }

    const totals = todayTracking.meals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );

    const totalGrams = totals.protein + totals.carbs + totals.fat;

    if (totalGrams === 0) {
      return { protein: 28, fat: 35, carbs: 37 };
    }

    return {
      protein: Math.round((totals.protein / totalGrams) * 100),
      fat: Math.round((totals.fat / totalGrams) * 100),
      carbs: Math.round((totals.carbs / totalGrams) * 100),
    };
  }, [todayTracking]);

  // Enhanced user data with real tracking information
  const userData = useMemo(() => {
    if (!user || !todayTracking || !nutritionGoals) {
      return null;
    }

    return {
      name: user.name || "User",
      // Enhanced calorie burned calculation
      caloriesBurned: Math.round(
        // Base calories from tracking
        todayTracking.caloriesBurned +
          // Calories from steps (approx 0.04 cal per step)
          (todaySteps?.steps || 0) * 0.04 +
          // Calories from today's workouts
          (weeklyWorkouts?.totalCalories || 0) / 7 +
          // Additional metabolic calories based on activity level
          (todayTracking?.activities?.reduce(
            (sum, activity) => sum + activity.duration * 5,
            0,
          ) || 0), // roughly 5 cal per minute
      ),
      caloriesEaten: todayTracking.caloriesConsumed,
      caloriesTarget: nutritionGoals.calories,

      // Real nutrition breakdown
      protein: nutritionBreakdown.protein,
      fat: nutritionBreakdown.fat,
      carbs: nutritionBreakdown.carbs,

      // Weekly statistics (real or calculated)
      weeklySteps: weeklyStats?.averageSteps || 0,
      weeklySleep: weeklyStats?.averageSleep
        ? `${Math.floor(weeklyStats.averageSleep)}h ${Math.round((weeklyStats.averageSleep % 1) * 60)}m`
        : "0h 0m",
      weeklyWorkouts: weeklyStats?.totalWorkouts * 60 || 0, // convert to minutes
      weeklyMeditation: weeklyStats?.totalMeditation || 0,
      sleepQuality: weeklyStats?.averageSleepQuality || 0,
      sleepConsistency: weeklyStats?.sleepConsistency || 0,

      // Daily values from tracking (use enhanced tracking systems)
      todaySteps: todaySteps?.steps || todayTracking.steps,
      todayDistance: todaySteps?.distance || 0,
      todayActiveMinutes: todaySteps?.activeMinutes || 0,
      stepGoal: stepGoals?.dailySteps || 10000,
      todayWater: todayWater?.totalIntake || todayTracking.waterIntake,
      waterTarget:
        todayWater?.goal || waterGoals?.dailyGlasses || nutritionGoals.water,
      waterGoalReached: todayWater?.goalReached || false,
      waterProgress: todayWater
        ? Math.round((todayWater.totalIntake / todayWater.goal) * 100)
        : 0,
      weeklyWorkoutMinutes: weeklyWorkouts?.totalMinutes || 0,
      weeklyWorkoutTarget: weeklyWorkouts?.goalMinutes || 150,
      workoutProgress: weeklyWorkouts?.minuteProgress || 0,

      // Enhanced weekly statistics
      weeklyCalories: weeklyStats?.averageCalories || 0,
      weeklySleepHours: weeklyStats?.averageSleep || 0,

      currentWeight: parseFloat(user.weight),

      // User profile data
      bmr: user.bmr,
      dailyCalories: user.dailyCalories,
      goal: user.goal,
    };
  }, [
    user,
    todayTracking,
    nutritionGoals,
    nutritionBreakdown,
    weeklyStats,
    todaySteps,
    stepGoals,
    todayWater,
    waterGoals,
    weeklyWorkouts,
  ]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Quick action handlers
  const handleAddWater = () => {
    if (todayWater) {
      // Use professional water tracking system
      const updated = addWaterEntry(telegramId, 1, "water", "room");
      setTodayWater(updated);

      // Also update general tracking for compatibility
      if (todayTracking) {
        const generalUpdated = updateTodayTracking(telegramId, {
          waterIntake: updated.totalIntake,
        });
        setTodayTracking(generalUpdated);
      }
    }
  };

  const handleAddWorkout = (type: string, duration: number) => {
    if (user && weeklyWorkouts) {
      // Log quick workout
      logQuickWorkout(
        telegramId,
        type as any,
        duration,
        "moderate",
        parseFloat(user.weight),
      );

      // Refresh weekly workout summary
      const updated = getWeeklyWorkoutSummary(telegramId);
      setWeeklyWorkouts(updated);
    }
  };

  const handleAddSteps = (steps: number) => {
    if (user && todaySteps) {
      // Update step tracking system
      const updatedSteps = addSteps(
        telegramId,
        steps,
        parseFloat(user.height),
        parseFloat(user.weight),
      );
      setTodaySteps(updatedSteps);

      // Also update general tracking for compatibility
      if (todayTracking) {
        const updated = updateTodayTracking(telegramId, {
          steps: updatedSteps.steps,
        });
        setTodayTracking(updated);
      }

      // Check for new achievements
      checkAchievements(telegramId);
    }
  };

  // Loading state with professional design
  if (isLoading || !user || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/60 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">Yuklanmoqda...</p>
            <p className="text-muted-foreground text-sm">
              Ma'lumotlaringiz tayyorlanmoqda
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background theme-transition">
      <div className="responsive-container">
        {/* Enhanced Header */}
        <div className="responsive-flex justify-between py-6">
          <div>
            <p className="responsive-text text-lg font-semibold text-foreground">{t('general.today')}, {todayDate}</p>
            <p className="text-muted-foreground text-sm">{t('pages.home.hello')}, {userData.name}!</p>
          </div>
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Enhanced Professional Calorie Tracking */}
        <div className="flex flex-col items-center py-6 theme-transition">
          {/* Advanced Calorie Burned Circle with better design */}
          <Card className="relative mb-8 p-8 bg-gradient-to-br from-background via-card to-muted/30 border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-500 w-full max-w-sm">
            <CardContent className="p-0">
              <div className="flex flex-col items-center">
                <CircularProgress
                  value={userData.caloriesBurned}
                  max={userData.caloriesTarget}
                  size={220}
                  strokeWidth={12}
                  color="url(#gradient)"
                >
                  <div className="text-center space-y-2">
                    <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-none">
                      {Math.round(userData.caloriesBurned)}
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wide">{t('pages.home.burnedToday')}</div>
                    <div className="text-xs text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">{t('pages.home.goal')} {userData.caloriesTarget} kcal</div>
                  </div>
                </CircularProgress>
                
                {/* Add SVG gradient definition */}
                <svg className="absolute" width="0" height="0">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="50%" stopColor="hsl(var(--calorie-primary))" />
                      <stop offset="100%" stopColor="hsl(var(--water-primary))" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Nutrition Breakdown with better visual design */}
          <Card className="w-full max-w-md mb-8 bg-gradient-to-r from-card to-muted/20 border border-border/30 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-center font-semibold text-foreground mb-4 text-lg">{t('pages.home.nutrition')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-white font-bold text-lg">{Math.round(userData.protein || 0)}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Protein
                    </div>
                  </div>
                </div>
                
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-white font-bold text-lg">{Math.round(userData.fat || 0)}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Yog'
                    </div>
                  </div>
                </div>
                
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-white font-bold text-lg">{Math.round(userData.carbs || 0)}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Uglevod
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Daily Stats Cards with better design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8">
            <Card className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Apple className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                  {Math.round(userData.caloriesEaten)}
                </div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                  Kcal
                </div>
                <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>Iste'mol qilingan</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Flame className="h-7 w-7 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2 group-hover:text-orange-600 transition-colors">
                  {Math.round(userData.caloriesBurned)}
                </div>
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">
                  Kcal
                </div>
                <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Yoqilgan</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Goal Progress Bar */}
          <Card className="card-professional w-full mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="heading-responsive text-foreground">{t('pages.home.progress')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(userData.caloriesEaten)} kcal dan{" "}
                    {userData.caloriesTarget} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(
                      (userData.caloriesEaten / userData.caloriesTarget) * 100,
                    )}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">{userData.caloriesTarget - Math.round(userData.caloriesEaten)} kcal {t('pages.home.left')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{
                        width: `${Math.min((userData.caloriesEaten / userData.caloriesTarget) * 100, 100)}%`,
                      }}
                    >
                      <div className="absolute right-0 top-1/2 w-3 h-3 bg-background rounded-full shadow-md transform -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(userData.caloriesEaten)} kcal</span>
                  <span className="font-medium">
                    {Math.round(
                      (userData.caloriesEaten / userData.caloriesTarget) * 100,
                    )}
                    %
                  </span>
                  <span>{userData.caloriesTarget} kcal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Average Section */}
        <div className="mb-6">
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-responsive text-foreground">{t('pages.home.averageWeek')}</h3>
                <Link
                  to="/analytics"
                  className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                >
                  {t('pages.home.details')}
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(userData.weeklyCalories || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O'rtacha kaloriya
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(userData.weeklyWorkouts || 0)}m
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O'rtacha mashq
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(userData.weeklySleepHours || 0)}h
                  </p>
                  <p className="text-xs text-muted-foreground">O'rtacha uyqu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Statistics */}
        <div className="pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-responsive text-foreground">{t('pages.home.tracking')}</h2>
            <Link to="/analytics">
              <button className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                {t('pages.home.details')}
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Walk Steps */}
            <Link to="/step-tracker">
              <div className="card-professional p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Footprints className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userData.todaySteps >= userData.stepGoal
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        (userData.todaySteps / userData.stepGoal) * 100,
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">{t('pages.home.steps')}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSteps(1000);
                      }}
                      className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {userData.todaySteps
                      ? userData.todaySteps.toLocaleString()
                      : "0"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('pages.home.targetShort')}: {userData.stepGoal ? userData.stepGoal.toLocaleString() : "10,000"}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{userData.todayDistance ? `${userData.todayDistance.toFixed(1)} ${t('pages.home.distanceKm')}` : `0 ${t('pages.home.distanceKm')}`}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((userData.todaySteps / userData.stepGoal) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Sleep */}
            <Link to="/sleep-tracker">
              <div className="card-professional p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userData.sleepQuality >= 4
                          ? "bg-green-500"
                          : userData.sleepQuality >= 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {userData.sleepQuality.toFixed(1)}/5
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Uyqu
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {userData.weeklySleep}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Sifat:{" "}
                      {userData.sleepQuality > 0
                        ? userData.sleepQuality.toFixed(1)
                        : "N/A"}
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400">
                      {userData.sleepConsistency > 0
                        ? `${userData.sleepConsistency}% barqaror`
                        : "Uyqu kuzatish"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Workouts */}
            <Link to="/workout-tracker">
              <div className="card-professional p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userData.workoutProgress >= 100
                          ? "bg-green-500"
                          : userData.workoutProgress >= 70
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {userData.workoutProgress}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">{t('pages.home.workouts')}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddWorkout("cardio", 20);
                      }}
                      className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {userData.weeklyWorkoutMinutes} min
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{t('pages.home.weekTotal')}</p>
                    <p className="text-xs text-muted-foreground">{t('pages.home.targetShort')}: {userData.weeklyWorkoutTarget}min</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(userData.workoutProgress, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Water Intake */}
            <Link to="/water-tracker">
              <div className="card-professional p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {userData.waterGoalReached && (
                      <div className="text-xs">🎉</div>
                    )}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userData.waterGoalReached
                          ? "bg-green-500"
                          : userData.waterProgress >= 70
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {userData.waterProgress}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                      Suv
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddWater();
                      }}
                      className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-foreground">{userData.todayWater?.toFixed(1) || 0}/{userData.waterTarget}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {userData.waterGoalReached ? t('pages.home.waterGoalReached') : t('pages.home.keepDrinking')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userData.waterGoalReached ? "✅" : `${(userData.waterTarget - (userData.todayWater || 0)).toFixed(1)} ${t('pages.home.waterLeftSuffix')}`}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        userData.waterGoalReached
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${Math.min(userData.waterProgress, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* AI Recommendation Alerts */}
          {userData.caloriesEaten < userData.caloriesTarget * 0.7 && (
            <div className="mt-6 card-professional bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-3 p-4">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    AI Tavsiya
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Siz bugun{" "}
                    {Math.round(
                      userData.caloriesTarget - userData.caloriesEaten,
                    )}{" "}
                    kaloriya kam iste'mol qildingiz. Sog'lom atıştırmalık
                    qo'shing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {userData.caloriesEaten > userData.caloriesTarget * 1.1 && (
            <div className="mt-6 card-professional bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3 p-4">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                    Harakat Tavsiyasi
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Maqsaddan{" "}
                    {Math.round(
                      userData.caloriesEaten - userData.caloriesTarget,
                    )}{" "}
                    kaloriya oshib ketdingiz. Qo'shimcha{" "}
                    {Math.round(
                      (userData.caloriesEaten - userData.caloriesTarget) / 8,
                    )}{" "}
                    daqiqa yurish tavsiya etiladi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {userData.todayWater < userData.waterTarget * 0.6 && (
            <div className="mt-6 card-professional bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3 p-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Suv Eslatmasi
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Yana {userData.waterTarget - userData.todayWater} stakan suv
                    ichishingiz kerak. Gidratatsiya sog'ligingiz uchun muhim!
                  </p>
                  <button
                    onClick={handleAddWater}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Suv qo'shish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          <div className="mt-6 card-professional bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
            <div className="p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                Bugungi xulosa
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {Math.round(
                      ((userData.caloriesEaten / userData.caloriesTarget +
                        userData.todayWater / userData.waterTarget +
                        userData.todaySteps / 10000) /
                        3) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Umumiy maqsad
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {user?.bmr || 0}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    BMR
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 space-y-3">
            <Link to="/add-meal">
              <Button className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-semibold">Ovqat Qo'shish</span>
              </Button>
            </Link>

            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleAddWater}
                variant="outline"
                className="h-12 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-semibold rounded-xl"
              >
                <Droplets className="mr-2 h-4 w-4" />
                Suv +1
              </Button>
              <Button
                onClick={() => handleAddSteps(1000)}
                variant="outline"
                className="h-12 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-300 font-semibold rounded-xl"
              >
                <Footprints className="mr-2 h-4 w-4" />
                Qadam +1K
              </Button>
              <Button
                onClick={() => handleAddWorkout("strength", 30)}
                variant="outline"
                className="h-12 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-700 dark:text-orange-300 font-semibold rounded-xl"
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                Mashq +30m
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
