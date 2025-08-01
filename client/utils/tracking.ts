import { UserProfile } from "@/contexts/UserContext";
import {
  getTodaySleep,
  getSleepInsights,
  addSampleSleepData,
} from "./sleepTracking";

// === INTERFACES ===
export interface DailyTracking {
  date: string; // YYYY-MM-DD format
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number; // glasses
  steps: number;
  activities: Activity[];
  meals: Meal[];
  weight?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  sleep?: {
    bedTime: string;
    wakeTime: string;
    duration: number; // hours
  };
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  timestamp: string;
  type: "cardio" | "strength" | "sports" | "walking" | "other";
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timestamp: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
}

export interface WeeklyStats {
  averageCalories: number;
  averageCaloriesBurned: number;
  averageSteps: number;
  averageSleep: number;
  averageSleepQuality: number;
  totalWorkouts: number;
  totalMeditation: number;
  weightChange: number;
  sleepConsistency: number;
  averageWaterIntake: number;
  weeklyCalorieDeficit: number;
}

// === UTILITY FUNCTIONS ===

// Get today's date in YYYY-MM-DD format
export const getTodayKey = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Get or create today's tracking data
export const getTodayTracking = (telegramId: string): DailyTracking => {
  const todayKey = getTodayKey();
  const storageKey = `tracking_${telegramId}_${todayKey}`;

  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error("Error parsing tracking data:", error);
    }
  }

  // Create new tracking data for today
  const newTracking: DailyTracking = {
    date: todayKey,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    waterIntake: 0,
    steps: 0,
    activities: [],
    meals: [],
    notes: "",
  };

  localStorage.setItem(storageKey, JSON.stringify(newTracking));
  return newTracking;
};

// Update today's tracking data
export const updateTodayTracking = (
  telegramId: string,
  updates: Partial<DailyTracking>,
): DailyTracking => {
  const current = getTodayTracking(telegramId);
  const updated = { ...current, ...updates };

  const todayKey = getTodayKey();
  const storageKey = `tracking_${telegramId}_${todayKey}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));

  return updated;
};

// Calculate nutrition goals based on user profile
export const calculateNutritionGoals = (user: UserProfile) => {
  const dailyCalories = user.dailyCalories || 2200;

  return {
    calories: dailyCalories,
    protein: Math.round((dailyCalories * 0.25) / 4), // 25% of calories from protein (4 cal/g)
    carbs: Math.round((dailyCalories * 0.45) / 4), // 45% of calories from carbs (4 cal/g)
    fat: Math.round((dailyCalories * 0.3) / 9), // 30% of calories from fat (9 cal/g)
    fiber: user.gender === "male" ? 35 : 28, // Daily fiber recommendation
    water: 8, // glasses per day
  };
};

// Calculate BMR based on user data
export const calculateBMR = (user: UserProfile): number => {
  const weight = parseFloat(user.weight);
  const height = parseFloat(user.height);
  const age = user.age;

  if (user.gender === "male") {
    return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age);
  } else {
    return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.33 * age);
  }
};

// Calculate daily calorie needs
export const calculateDailyCalories = (user: UserProfile): number => {
  const bmr = calculateBMR(user);

  const activityMultipliers = {
    low: 1.2,
    medium: 1.55,
    high: 1.725,
  };

  const multiplier =
    activityMultipliers[
      user.activityLevel as keyof typeof activityMultipliers
    ] || 1.55;
  return Math.round(bmr * multiplier);
};

// Get weekly statistics
export const getWeeklyStats = (telegramId: string): WeeklyStats => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  const weeklyData = last7Days
    .map((date) => {
      const storageKey = `tracking_${telegramId}_${date}`;
      const data = localStorage.getItem(storageKey);
      return data ? (JSON.parse(data) as DailyTracking) : null;
    })
    .filter(Boolean);

  // Get sleep data from sleep tracking system
  const sleepData = last7Days
    .map((date) => {
      const storageKey = `sleep_${telegramId}_${date}`;
      const data = localStorage.getItem(storageKey);
      try {
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (weeklyData.length === 0 && sleepData.length === 0) {
    return {
      averageCalories: 0,
      averageCaloriesBurned: 0,
      averageSteps: 0,
      averageSleep: 0,
      averageSleepQuality: 0,
      totalWorkouts: 0,
      totalMeditation: 0,
      weightChange: 0,
      sleepConsistency: 0,
      averageWaterIntake: 0,
      weeklyCalorieDeficit: 0,
    };
  }

  const averageCalories =
    weeklyData.length > 0
      ? Math.round(
          weeklyData.reduce((sum, day) => sum + day.caloriesConsumed, 0) /
            weeklyData.length,
        )
      : 0;

  const averageSteps =
    weeklyData.length > 0
      ? Math.round(
          weeklyData.reduce((sum, day) => sum + day.steps, 0) /
            weeklyData.length,
        )
      : 0;

  // Sleep statistics from sleep tracking system
  const averageSleep =
    sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + sleep.sleepDuration, 0) /
        sleepData.length
      : 0;

  const averageSleepQuality =
    sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + sleep.sleepQuality, 0) /
        sleepData.length
      : 0;

  // Calculate sleep consistency (0-100 score)
  const sleepConsistency =
    sleepData.length >= 2
      ? (() => {
          let consistencyScore = 0;
          const sleepTimes = sleepData.map((s) => {
            const [bedHour, bedMin] = s.bedTime.split(":").map(Number);
            const [wakeHour, wakeMin] = s.wakeTime.split(":").map(Number);
            return {
              bedTime: bedHour * 60 + bedMin,
              wakeTime: wakeHour * 60 + wakeMin,
            };
          });

          // Calculate variance in sleep times
          const avgBedTime =
            sleepTimes.reduce((sum, t) => sum + t.bedTime, 0) /
            sleepTimes.length;
          const avgWakeTime =
            sleepTimes.reduce((sum, t) => sum + t.wakeTime, 0) /
            sleepTimes.length;

          const bedVariance =
            sleepTimes.reduce(
              (sum, t) => sum + Math.pow(t.bedTime - avgBedTime, 2),
              0,
            ) / sleepTimes.length;
          const wakeVariance =
            sleepTimes.reduce(
              (sum, t) => sum + Math.pow(t.wakeTime - avgWakeTime, 2),
              0,
            ) / sleepTimes.length;

          const bedStdDev = Math.sqrt(bedVariance);
          const wakeStdDev = Math.sqrt(wakeVariance);

          // Convert to consistency score (lower deviation = higher score)
          const bedConsistency = Math.max(0, 100 - (bedStdDev / 60) * 100); // 1 hour stddev = 0 points
          const wakeConsistency = Math.max(0, 100 - (wakeStdDev / 60) * 100);

          return Math.round((bedConsistency + wakeConsistency) / 2);
        })()
      : 0;

  const totalWorkouts = weeklyData.reduce(
    (sum, day) =>
      sum + day.activities.filter((a) => a.type !== "walking").length,
    0,
  );

  const totalMeditation = weeklyData.reduce(
    (sum, day) =>
      sum +
      day.activities
        .filter(
          (a) =>
            a.name.toLowerCase().includes("meditation") ||
            a.name.toLowerCase().includes("yoga"),
        )
        .reduce((actSum, act) => actSum + act.duration, 0),
    0,
  );

  const weights = weeklyData
    .filter((day) => day.weight)
    .map((day) => day.weight!);
  const weightChange =
    weights.length >= 2 ? weights[0] - weights[weights.length - 1] : 0;

  // Calculate average calories burned from activities
  const averageCaloriesBurned =
    weeklyData.reduce((sum, day) => {
      const dailyBurned = day.activities.reduce((actSum, activity) => {
        // Estimate calories burned based on activity type and duration
        const weight = day.weight || 70; // default weight
        return (
          actSum +
          calculateCaloriesBurned(activity.type, activity.duration, weight)
        );
      }, 0);
      return sum + dailyBurned;
    }, 0) / 7; // average per day

  // Calculate average water intake
  const averageWaterIntake =
    weeklyData.reduce((sum, day) => sum + day.waterIntake, 0) / 7;

  // Calculate weekly calorie deficit (calories eaten vs burned)
  const weeklyCalorieDeficit = averageCaloriesBurned * 7 - averageCalories * 7;

  return {
    averageCalories,
    averageCaloriesBurned: Math.round(averageCaloriesBurned),
    averageSteps,
    averageSleep: Math.round(averageSleep * 100) / 100,
    averageSleepQuality: Math.round(averageSleepQuality * 100) / 100,
    totalWorkouts,
    totalMeditation,
    weightChange,
    sleepConsistency,
    averageWaterIntake: Math.round(averageWaterIntake * 10) / 10,
    weeklyCalorieDeficit: Math.round(weeklyCalorieDeficit),
  };
};

// Calculate calories burned from activity
export const calculateCaloriesBurned = (
  activityType: string,
  duration: number, // minutes
  weight: number, // kg
): number => {
  // MET values for different activities
  const metValues: Record<string, number> = {
    walking: 3.5,
    running: 8.0,
    cycling: 6.0,
    swimming: 6.0,
    strength: 3.0,
    yoga: 2.5,
    dancing: 4.5,
    cleaning: 3.0,
    gardening: 3.8,
    cooking: 2.0,
  };

  const met = metValues[activityType.toLowerCase()] || 3.0;

  // Calories burned = MET × weight (kg) × time (hours)
  return Math.round(met * weight * (duration / 60));
};

// Add sample data for testing
export const addSampleData = (telegramId: string, user: UserProfile): void => {
  // Don't add sample data if user already has data
  const today = getTodayTracking(telegramId);
  if (today.caloriesConsumed > 0) return;

  // Add some realistic sample data
  const sampleData: Partial<DailyTracking> = {
    caloriesConsumed: 1850,
    caloriesBurned: 320,
    waterIntake: 6,
    steps: 8234,
    activities: [
      {
        id: Date.now().toString(),
        name: "Morning Walk",
        duration: 30,
        caloriesBurned: 150,
        timestamp: new Date().toISOString(),
        type: "walking",
      },
      {
        id: (Date.now() + 1).toString(),
        name: "Workout",
        duration: 45,
        caloriesBurned: 170,
        timestamp: new Date().toISOString(),
        type: "strength",
      },
    ],
    meals: [
      {
        id: Date.now().toString(),
        name: "Breakfast",
        calories: 450,
        protein: 20,
        carbs: 65,
        fat: 15,
        fiber: 8,
        timestamp: new Date().toISOString(),
        type: "breakfast",
      },
      {
        id: (Date.now() + 1).toString(),
        name: "Lunch",
        calories: 650,
        protein: 35,
        carbs: 80,
        fat: 20,
        fiber: 12,
        timestamp: new Date().toISOString(),
        type: "lunch",
      },
      {
        id: (Date.now() + 2).toString(),
        name: "Dinner",
        calories: 550,
        protein: 30,
        carbs: 60,
        fat: 18,
        fiber: 10,
        timestamp: new Date().toISOString(),
        type: "dinner",
      },
      {
        id: (Date.now() + 3).toString(),
        name: "Snack",
        calories: 200,
        protein: 8,
        carbs: 25,
        fat: 8,
        fiber: 3,
        timestamp: new Date().toISOString(),
        type: "snack",
      },
    ],
  };

  updateTodayTracking(telegramId, sampleData);

  // Also add sample sleep data
  addSampleSleepData(telegramId);
};
