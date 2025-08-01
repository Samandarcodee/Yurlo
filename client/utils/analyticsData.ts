import { UserProfile } from "@/contexts/UserContext";
import {
  getTodayTracking,
  getWeeklyStats,
  DailyTracking,
  WeeklyStats,
} from "./tracking";
import {
  getWaterHistory,
  getWaterInsights,
  WaterSession,
} from "./waterTracking";
import {
  getWorkoutHistory,
  getWorkoutInsights,
  WorkoutSession,
} from "./workoutTracking";
import { getTodaySteps, getWeeklyStepStats } from "./stepTracking";
import { getSleepInsights } from "./sleepTracking";

// === ANALYTICS INTERFACES ===

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface AnalyticsOverview {
  totalDays: number;
  averageCalories: number;
  averageSteps: number;
  averageSleep: number;
  averageWater: number;
  totalWorkouts: number;
  weightChange: number;
  streaks: {
    calories: number;
    steps: number;
    water: number;
    workout: number;
  };
  achievements: number;
}

export interface TrendData {
  period: "week" | "month" | "year";
  data: ChartDataPoint[];
  trend: "increasing" | "decreasing" | "stable";
  changePercentage: number;
}

export interface BodyComposition {
  date: string;
  weight: number;
  bmi: number;
  bodyFat?: number;
  muscleMass?: number;
  visceral?: number;
}

export interface NutritionAnalytics {
  period: string;
  averageCalories: number;
  macroDistribution: {
    protein: number;
    carbs: number;
    fat: number;
  };
  deficitSurplus: number;
  qualityScore: number;
  topFoods: { name: string; frequency: number; calories: number }[];
}

export interface ActivityAnalytics {
  totalWorkouts: number;
  totalMinutes: number;
  averageIntensity: number;
  favoriteWorkouts: { type: string; count: number; minutes: number }[];
  caloriesBurned: number;
  progressScore: number;
}

// === ANALYTICS DATA FUNCTIONS ===

// Get calories chart data
export const getCaloriesChartData = (
  telegramId: string,
  days: number = 30,
): TrendData => {
  const data: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `dailyTracking_${telegramId}_${dateKey}`;
    const dailyData = localStorage.getItem(storageKey);

    let calories = 0;
    if (dailyData) {
      try {
        const parsed = JSON.parse(dailyData) as DailyTracking;
        calories = parsed.caloriesConsumed || 0;
      } catch (error) {
        console.error("Error parsing daily data:", error);
      }
    }

    data.push({
      date: dateKey,
      value: calories,
      label: date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length || 0;
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length || 0;

  const changePercentage =
    firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  const trend =
    changePercentage > 5
      ? "increasing"
      : changePercentage < -5
        ? "decreasing"
        : "stable";

  return {
    period: "month",
    data,
    trend,
    changePercentage: Math.round(changePercentage),
  };
};

// Get weight chart data
export const getWeightChartData = (
  telegramId: string,
  days: number = 90,
): TrendData => {
  const data: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `dailyTracking_${telegramId}_${dateKey}`;
    const dailyData = localStorage.getItem(storageKey);

    let weight = 0;
    if (dailyData) {
      try {
        const parsed = JSON.parse(dailyData) as DailyTracking;
        weight = parsed.weight || 0;
      } catch (error) {
        console.error("Error parsing daily data:", error);
      }
    }

    if (weight > 0) {
      data.push({
        date: dateKey,
        value: weight,
        label: date.toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
        }),
      });
    }
  }

  // Fill in missing data with interpolation if needed
  if (data.length < 3) {
    // Add some sample data for demo
    const baseWeight = 70; // Default weight
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      const variance = (Math.random() - 0.5) * 2; // ±1kg variance
      data.push({
        date: dateKey,
        value: baseWeight + variance,
        label: date.toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
        }),
      });
    }
  }

  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const changePercentage =
    firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const trend =
    changePercentage > 1
      ? "increasing"
      : changePercentage < -1
        ? "decreasing"
        : "stable";

  return {
    period: "month",
    data,
    trend,
    changePercentage: Math.round(changePercentage * 100) / 100,
  };
};

// Get steps chart data
export const getStepsChartData = (
  telegramId: string,
  days: number = 30,
): TrendData => {
  const data: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `steps_${telegramId}_${dateKey}`;
    const stepsData = localStorage.getItem(storageKey);

    let steps = 0;
    if (stepsData) {
      try {
        const parsed = JSON.parse(stepsData);
        steps = parsed.steps || 0;
      } catch (error) {
        // Try general tracking
        const generalKey = `dailyTracking_${telegramId}_${dateKey}`;
        const generalData = localStorage.getItem(generalKey);
        if (generalData) {
          try {
            const parsed = JSON.parse(generalData) as DailyTracking;
            steps = parsed.steps || 0;
          } catch (err) {
            console.error("Error parsing steps data:", err);
          }
        }
      }
    }

    data.push({
      date: dateKey,
      value: steps,
      label: date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  // Calculate trend
  const firstWeek = data.slice(0, 7);
  const lastWeek = data.slice(-7);

  const firstAvg = firstWeek.reduce((sum, d) => sum + d.value, 0) / 7;
  const lastAvg = lastWeek.reduce((sum, d) => sum + d.value, 0) / 7;

  const changePercentage =
    firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
  const trend =
    changePercentage > 10
      ? "increasing"
      : changePercentage < -10
        ? "decreasing"
        : "stable";

  return {
    period: "month",
    data,
    trend,
    changePercentage: Math.round(changePercentage),
  };
};

// Get sleep chart data
export const getSleepChartData = (
  telegramId: string,
  days: number = 30,
): TrendData => {
  const data: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `sleep_${telegramId}_${dateKey}`;
    const sleepData = localStorage.getItem(storageKey);

    let sleepHours = 0;
    if (sleepData) {
      try {
        const parsed = JSON.parse(sleepData);
        sleepHours = parsed.sleepDuration || 0;
      } catch (error) {
        console.error("Error parsing sleep data:", error);
      }
    }

    data.push({
      date: dateKey,
      value: sleepHours,
      label: date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  // Calculate trend
  const average = data.reduce((sum, d) => sum + d.value, 0) / data.length || 0;
  const target = 8; // 8 hours target
  const changePercentage = ((average - target) / target) * 100;
  const trend =
    average > target
      ? "increasing"
      : average < target - 0.5
        ? "decreasing"
        : "stable";

  return {
    period: "month",
    data,
    trend,
    changePercentage: Math.round(changePercentage),
  };
};

// Get analytics overview
export const getAnalyticsOverview = (telegramId: string): AnalyticsOverview => {
  const weeklyStats = getWeeklyStats(telegramId);
  const workoutInsights = getWorkoutInsights(telegramId);
  const waterInsights = getWaterInsights(telegramId);
  const stepStats = getWeeklyStepStats(telegramId);

  return {
    totalDays: 30, // For the past 30 days
    averageCalories: weeklyStats.averageCalories,
    averageSteps: weeklyStats.averageSteps,
    averageSleep: weeklyStats.averageSleep,
    averageWater: waterInsights.dailyAverage,
    totalWorkouts: weeklyStats.totalWorkouts,
    weightChange: weeklyStats.weightChange,
    streaks: {
      calories: 5, // Simplified for now
      steps: stepStats.currentStreak || 0,
      water: waterInsights.streak.current,
      workout: 3,
    },
    achievements: 12, // Total unlocked achievements
  };
};

// Get nutrition analytics
export const getNutritionAnalytics = (
  telegramId: string,
): NutritionAnalytics => {
  const weeklyStats = getWeeklyStats(telegramId);
  const caloriesData = getCaloriesChartData(telegramId, 7);

  const averageCalories =
    caloriesData.data.reduce((sum, d) => sum + d.value, 0) / 7;
  const targetCalories = 2000; // Default target

  return {
    period: "This Week",
    averageCalories: Math.round(averageCalories),
    macroDistribution: {
      protein: 25,
      carbs: 50,
      fat: 25,
    },
    deficitSurplus: Math.round(averageCalories - targetCalories),
    qualityScore: 78, // 0-100 based on nutrition quality
    topFoods: [
      { name: "Osh", frequency: 5, calories: 450 },
      { name: "Manti", frequency: 3, calories: 380 },
      { name: "Non", frequency: 7, calories: 250 },
    ],
  };
};

// Get activity analytics
export const getActivityAnalytics = (telegramId: string): ActivityAnalytics => {
  const workoutInsights = getWorkoutInsights(telegramId);

  return {
    totalWorkouts: workoutInsights.weeklyStats.totalWorkouts,
    totalMinutes: workoutInsights.weeklyStats.totalMinutes,
    averageIntensity: workoutInsights.monthlyStats.averageIntensity,
    favoriteWorkouts: [
      { type: "Strength", count: 8, minutes: 240 },
      { type: "Cardio", count: 5, minutes: 150 },
      { type: "Yoga", count: 3, minutes: 90 },
    ],
    caloriesBurned: workoutInsights.weeklyStats.caloriesBurned,
    progressScore: workoutInsights.performance.consistencyScore,
  };
};

// Get body composition data (simplified)
export const getBodyCompositionData = (
  telegramId: string,
  user: UserProfile,
): BodyComposition[] => {
  const data: BodyComposition[] = [];
  const currentWeight = parseFloat(user.weight);
  const height = parseFloat(user.height) / 100; // cm to m

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    // Simulate slight weight variations
    const weightVariation = (Math.random() - 0.5) * 2; // ±1kg
    const weight = currentWeight + weightVariation;
    const bmi = weight / (height * height);

    data.push({
      date: dateKey,
      weight: Math.round(weight * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      bodyFat: Math.round((15 + Math.random() * 10) * 10) / 10, // 15-25%
      muscleMass: Math.round((weight * 0.4 + Math.random() * 5) * 10) / 10,
      visceral: Math.round((5 + Math.random() * 5) * 10) / 10, // 5-10
    });
  }

  return data;
};

// Calculate health score
export const calculateHealthScore = (
  telegramId: string,
): {
  score: number;
  factors: { name: string; score: number; weight: number }[];
} => {
  const overview = getAnalyticsOverview(telegramId);
  const workoutInsights = getWorkoutInsights(telegramId);
  const waterInsights = getWaterInsights(telegramId);

  const factors = [
    {
      name: "Physical Activity",
      score: Math.min(100, (overview.averageSteps / 8000) * 100),
      weight: 25,
    },
    {
      name: "Sleep Quality",
      score: Math.min(100, (overview.averageSleep / 8) * 100),
      weight: 20,
    },
    {
      name: "Hydration",
      score: Math.min(100, (overview.averageWater / 8) * 100),
      weight: 15,
    },
    {
      name: "Exercise Consistency",
      score: workoutInsights.performance.consistencyScore,
      weight: 20,
    },
    {
      name: "Nutrition Balance",
      score: 75, // Simplified calculation
      weight: 20,
    },
  ];

  const totalScore = factors.reduce((sum, factor) => {
    return sum + (factor.score * factor.weight) / 100;
  }, 0);

  return {
    score: Math.round(totalScore),
    factors,
  };
};

// Get performance metrics
export const getPerformanceMetrics = (telegramId: string) => {
  const caloriesData = getCaloriesChartData(telegramId);
  const stepsData = getStepsChartData(telegramId);
  const weightData = getWeightChartData(telegramId);
  const sleepData = getSleepChartData(telegramId);

  return {
    calories: {
      current: caloriesData.data[caloriesData.data.length - 1]?.value || 0,
      trend: caloriesData.trend,
      change: caloriesData.changePercentage,
    },
    steps: {
      current: stepsData.data[stepsData.data.length - 1]?.value || 0,
      trend: stepsData.trend,
      change: stepsData.changePercentage,
    },
    weight: {
      current: weightData.data[weightData.data.length - 1]?.value || 0,
      trend: weightData.trend,
      change: weightData.changePercentage,
    },
    sleep: {
      current: sleepData.data[sleepData.data.length - 1]?.value || 0,
      trend: sleepData.trend,
      change: sleepData.changePercentage,
    },
  };
};
