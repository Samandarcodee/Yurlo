import { UserProfile } from "@/contexts/UserContext";

// === INTERFACES ===
export interface StepSession {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  distance: number; // km
  calories: number;
  activeMinutes: number;
  floors?: number;
  timestamp: string;
  activities: StepActivity[];
  heartRate?: {
    average: number;
    max: number;
    zones: {
      fat_burn: number; // minutes
      cardio: number;
      peak: number;
    };
  };
  weather?: {
    condition: string;
    temperature: number;
  };
}

export interface StepActivity {
  id: string;
  type: "walking" | "running" | "hiking" | "stairs" | "dancing" | "sports";
  startTime: string;
  endTime: string;
  steps: number;
  distance: number;
  pace: number; // min/km
  calories: number;
  location?: string;
  notes?: string;
}

export interface StepGoals {
  dailySteps: number;
  weeklySteps: number;
  monthlySteps: number;
  dailyDistance: number; // km
  dailyActiveMinutes: number;
  dailyFloors?: number;
  weeklyWorkouts: number; // number of workout sessions
}

export interface StepChallenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  target: number;
  unit: "steps" | "distance" | "minutes" | "floors";
  startDate: string;
  endDate: string;
  progress: number;
  isCompleted: boolean;
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  participants?: number; // for group challenges
}

export interface StepAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "steps" | "distance" | "consistency" | "special";
  requirement: {
    type: "total_steps" | "daily_streak" | "single_day" | "distance" | "custom";
    value: number;
    period?: "day" | "week" | "month" | "all_time";
  };
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

export interface StepInsights {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyTotal: number;
  bestDay: {
    date: string;
    steps: number;
  };
  longestStreak: {
    current: number;
    best: number;
  };
  trends: {
    stepstrend: "increasing" | "decreasing" | "stable";
    distanceTrend: "increasing" | "decreasing" | "stable";
    consistencyScore: number; // 0-100
  };
  weeklyPattern: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  recommendations: string[];
  healthMetrics: {
    cardiovascularHealth: number; // 0-100
    fitnessLevel: number; // 0-100
    weightManagement: number; // 0-100
  };
}

// === UTILITY FUNCTIONS ===

// Get today's date key
const getTodayKey = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Calculate distance from steps (average stride length)
export const calculateDistance = (
  steps: number,
  userHeight: number = 170,
): number => {
  // Average stride length = height * 0.415
  const strideLength = userHeight * 0.415; // cm
  const distance = (steps * strideLength) / 100000; // convert to km
  return Math.round(distance * 100) / 100; // round to 2 decimal places
};

// Calculate calories burned from steps
export const calculateCaloriesFromSteps = (
  steps: number,
  weight: number = 70,
): number => {
  // Approximate: 0.04 calories per step per kg of body weight
  return Math.round(steps * 0.04 * weight);
};

// Calculate active minutes from steps (rough estimate)
export const calculateActiveMinutes = (steps: number): number => {
  // Assume average pace of 100 steps per minute for active time
  return Math.round(steps / 100);
};

// Get or create today's step session
export const getTodaySteps = (telegramId: string): StepSession => {
  const todayKey = getTodayKey();
  const storageKey = `steps_${telegramId}_${todayKey}`;

  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error("Error parsing step data:", error);
    }
  }

  // Create new session
  const newSession: StepSession = {
    id: Date.now().toString(),
    date: todayKey,
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    timestamp: new Date().toISOString(),
    activities: [],
  };

  localStorage.setItem(storageKey, JSON.stringify(newSession));
  return newSession;
};

// Update today's steps
export const updateTodaySteps = (
  telegramId: string,
  updates: Partial<StepSession>,
): StepSession => {
  const current = getTodaySteps(telegramId);
  const updated = {
    ...current,
    ...updates,
    timestamp: new Date().toISOString(),
  };

  const todayKey = getTodayKey();
  const storageKey = `steps_${telegramId}_${todayKey}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));

  return updated;
};

// Add steps manually or from activity
export const addSteps = (
  telegramId: string,
  steps: number,
  userHeight: number = 170,
  userWeight: number = 70,
): StepSession => {
  const current = getTodaySteps(telegramId);
  const newSteps = current.steps + steps;
  const newDistance = calculateDistance(newSteps, userHeight);
  const newCalories = calculateCaloriesFromSteps(newSteps, userWeight);
  const newActiveMinutes = calculateActiveMinutes(newSteps);

  return updateTodaySteps(telegramId, {
    steps: newSteps,
    distance: newDistance,
    calories: newCalories,
    activeMinutes: newActiveMinutes,
  });
};

// Get step goals
export const getStepGoals = (telegramId: string): StepGoals => {
  const storageKey = `stepGoals_${telegramId}`;
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing step goals:", error);
    }
  }

  // Default goals
  const defaultGoals: StepGoals = {
    dailySteps: 10000,
    weeklySteps: 70000,
    monthlySteps: 300000,
    dailyDistance: 7.5, // km
    dailyActiveMinutes: 150, // WHO recommendation
    dailyFloors: 10,
    weeklyWorkouts: 3,
  };

  localStorage.setItem(storageKey, JSON.stringify(defaultGoals));
  return defaultGoals;
};

// Update step goals
export const updateStepGoals = (
  telegramId: string,
  goals: Partial<StepGoals>,
): StepGoals => {
  const current = getStepGoals(telegramId);
  const updated = { ...current, ...goals };

  const storageKey = `stepGoals_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));

  return updated;
};

// Get step history for last N days
export const getStepHistory = (
  telegramId: string,
  days: number = 30,
): StepSession[] => {
  const sessions: StepSession[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `steps_${telegramId}_${dateKey}`;
    const data = localStorage.getItem(storageKey);

    if (data) {
      try {
        const session = JSON.parse(data) as StepSession;
        sessions.push(session);
      } catch (error) {
        console.error("Error parsing step session:", error);
      }
    }
  }

  return sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

// Get step insights
export const getStepInsights = (telegramId: string): StepInsights => {
  const history = getStepHistory(telegramId, 30);
  const last7Days = getStepHistory(telegramId, 7);

  if (history.length === 0) {
    return {
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyTotal: 0,
      bestDay: { date: "", steps: 0 },
      longestStreak: { current: 0, best: 0 },
      trends: {
        stepstrend: "stable",
        distanceTrend: "stable",
        consistencyScore: 0,
      },
      weeklyPattern: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
      recommendations: ["Qadam tracking'ni boshlang!"],
      healthMetrics: {
        cardiovascularHealth: 0,
        fitnessLevel: 0,
        weightManagement: 0,
      },
    };
  }

  // Calculate averages
  const dailyAverage = Math.round(
    history.reduce((sum, s) => sum + s.steps, 0) / history.length,
  );
  const weeklyAverage =
    last7Days.length > 0
      ? Math.round(
          last7Days.reduce((sum, s) => sum + s.steps, 0) / last7Days.length,
        )
      : dailyAverage;
  const monthlyTotal = history.reduce((sum, s) => sum + s.steps, 0);

  // Find best day
  const bestDay = history.reduce(
    (best, current) => (current.steps > best.steps ? current : best),
    { date: "", steps: 0 },
  );

  // Calculate streaks
  const goals = getStepGoals(telegramId);
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Sort by date ascending for streak calculation
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].steps >= goals.dailySteps) {
      tempStreak++;
      if (i === sortedHistory.length - 1) {
        // Most recent day
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      if (i === sortedHistory.length - 1) {
        // Most recent day failed
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }

  // Calculate trends
  const firstHalf = history.slice(Math.floor(history.length / 2));
  const secondHalf = history.slice(0, Math.floor(history.length / 2));

  const firstHalfAvg =
    firstHalf.reduce((sum, s) => sum + s.steps, 0) / firstHalf.length || 0;
  const secondHalfAvg =
    secondHalf.reduce((sum, s) => sum + s.steps, 0) / secondHalf.length || 0;

  const stepsChange = secondHalfAvg - firstHalfAvg;
  const stepsChangePercent =
    firstHalfAvg > 0 ? (stepsChange / firstHalfAvg) * 100 : 0;

  const stepstrend =
    stepsChangePercent > 5
      ? "increasing"
      : stepsChangePercent < -5
        ? "decreasing"
        : "stable";

  // Similar for distance
  const firstHalfDistance =
    firstHalf.reduce((sum, s) => sum + s.distance, 0) / firstHalf.length || 0;
  const secondHalfDistance =
    secondHalf.reduce((sum, s) => sum + s.distance, 0) / secondHalf.length || 0;
  const distanceChange = secondHalfDistance - firstHalfDistance;
  const distanceChangePercent =
    firstHalfDistance > 0 ? (distanceChange / firstHalfDistance) * 100 : 0;

  const distanceTrend =
    distanceChangePercent > 5
      ? "increasing"
      : distanceChangePercent < -5
        ? "decreasing"
        : "stable";

  // Consistency score
  const daysWithGoalMet = history.filter(
    (s) => s.steps >= goals.dailySteps,
  ).length;
  const consistencyScore = Math.round((daysWithGoalMet / history.length) * 100);

  // Weekly pattern
  const weeklyPattern = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  history.forEach((session) => {
    const dayOfWeek = new Date(session.date).getDay();
    const dayName = dayNames[dayOfWeek] as keyof typeof weeklyPattern;
    weeklyPattern[dayName] =
      weeklyPattern[dayName] + session.steps || session.steps;
  });

  // Average out the weekly pattern
  const weekCounts = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };
  history.forEach((session) => {
    const dayOfWeek = new Date(session.date).getDay();
    const dayName = dayNames[dayOfWeek] as keyof typeof weekCounts;
    weekCounts[dayName]++;
  });

  Object.keys(weeklyPattern).forEach((day) => {
    const dayKey = day as keyof typeof weeklyPattern;
    if (weekCounts[dayKey] > 0) {
      weeklyPattern[dayKey] = Math.round(
        weeklyPattern[dayKey] / weekCounts[dayKey],
      );
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (dailyAverage < goals.dailySteps) {
    const deficit = goals.dailySteps - dailyAverage;
    recommendations.push(
      `Kunlik maqsadga erishish uchun yana ${deficit.toLocaleString()} qadam tashlang`,
    );
  }

  if (consistencyScore < 70) {
    recommendations.push("Har kuni muntazam yurish rejimini yarating");
  }

  if (currentStreak === 0) {
    recommendations.push("Yangi streak boshlang - bugun maqsadga erishing!");
  } else if (currentStreak > 0) {
    recommendations.push(
      `Ajoyib! ${currentStreak} kunlik streak'ni davom ettiring`,
    );
  }

  const leastActiveDay = Object.entries(weeklyPattern).reduce(
    (min, [day, steps]) => (steps < min.steps ? { day, steps } : min),
    { day: "monday", steps: Infinity },
  );

  if (leastActiveDay.steps < dailyAverage * 0.8) {
    recommendations.push(
      `${leastActiveDay.day.charAt(0).toUpperCase() + leastActiveDay.day.slice(1)} kunlari ko'proq faol bo'lishga harakat qiling`,
    );
  }

  if (stepstrend === "decreasing") {
    recommendations.push(
      "Faolligingiz kamaymoqda - yangi motivatsiya topishga harakat qiling",
    );
  }

  // Health metrics calculation
  const cardiovascularHealth = Math.min(
    100,
    Math.round((dailyAverage / goals.dailySteps) * 100),
  );
  const fitnessLevel = Math.min(
    100,
    Math.round((dailyAverage / 10000) * 60 + consistencyScore * 0.4),
  );
  const weightManagement = Math.min(
    100,
    Math.round((dailyAverage / 10000) * 50 + consistencyScore * 0.5),
  );

  return {
    dailyAverage,
    weeklyAverage,
    monthlyTotal,
    bestDay,
    longestStreak: { current: currentStreak, best: bestStreak },
    trends: { stepstrend, distanceTrend, consistencyScore },
    weeklyPattern,
    recommendations,
    healthMetrics: {
      cardiovascularHealth,
      fitnessLevel,
      weightManagement,
    },
  };
};

// Predefined achievements
export const STEP_ACHIEVEMENTS: StepAchievement[] = [
  {
    id: "first_steps",
    title: "Birinchi Qadamlar",
    description: "Birinchi 1000 qadam",
    icon: "👟",
    category: "steps",
    requirement: { type: "total_steps", value: 1000 },
    rarity: "common",
    points: 10,
  },
  {
    id: "daily_goal",
    title: "Kunlik Maqsad",
    description: "Birinchi marta 10,000 qadam",
    icon: "🎯",
    category: "steps",
    requirement: { type: "single_day", value: 10000 },
    rarity: "common",
    points: 25,
  },
  {
    id: "week_warrior",
    title: "Haftalik Jangchi",
    description: "7 kun ketma-ket maqsadga erishing",
    icon: "🔥",
    category: "consistency",
    requirement: { type: "daily_streak", value: 7 },
    rarity: "rare",
    points: 50,
  },
  {
    id: "month_master",
    title: "Oylik Usta",
    description: "30 kun ketma-ket maqsadga erishing",
    icon: "👑",
    category: "consistency",
    requirement: { type: "daily_streak", value: 30 },
    rarity: "epic",
    points: 200,
  },
  {
    id: "marathon_walker",
    title: "Marafon Yuruvchi",
    description: "Bir kunda 42 km yurish",
    icon: "🏃‍♂️",
    category: "distance",
    requirement: { type: "single_day", value: 42000 }, // 42km in meters
    rarity: "legendary",
    points: 500,
  },
  {
    id: "hundred_k",
    title: "100K Club",
    description: "Jami 100,000 qadam",
    icon: "💯",
    category: "steps",
    requirement: { type: "total_steps", value: 100000 },
    rarity: "rare",
    points: 100,
  },
  {
    id: "million_steps",
    title: "Million Qadam",
    description: "Jami 1,000,000 qadam",
    icon: "🌟",
    category: "steps",
    requirement: { type: "total_steps", value: 1000000 },
    rarity: "legendary",
    points: 1000,
  },
];

// Check for new achievements
export const checkAchievements = (telegramId: string): StepAchievement[] => {
  const history = getStepHistory(telegramId, 365); // Check full year
  const insights = getStepInsights(telegramId);
  const storageKey = `achievements_${telegramId}`;

  const unlockedAchievements: StepAchievement[] = JSON.parse(
    localStorage.getItem(storageKey) || "[]",
  );

  const newAchievements: StepAchievement[] = [];

  STEP_ACHIEVEMENTS.forEach((achievement) => {
    // Skip if already unlocked
    if (unlockedAchievements.find((a) => a.id === achievement.id)) return;

    let achieved = false;

    switch (achievement.requirement.type) {
      case "total_steps":
        const totalSteps = history.reduce((sum, s) => sum + s.steps, 0);
        achieved = totalSteps >= achievement.requirement.value;
        break;

      case "single_day":
        if (achievement.category === "steps") {
          achieved = history.some(
            (s) => s.steps >= achievement.requirement.value,
          );
        } else if (achievement.category === "distance") {
          achieved = history.some(
            (s) => s.distance * 1000 >= achievement.requirement.value,
          ); // convert km to m
        }
        break;

      case "daily_streak":
        achieved = insights.longestStreak.best >= achievement.requirement.value;
        break;
    }

    if (achieved) {
      const unlockedAchievement = {
        ...achievement,
        unlockedAt: new Date().toISOString(),
      };
      newAchievements.push(unlockedAchievement);
    }
  });

  // Save new achievements
  if (newAchievements.length > 0) {
    const allAchievements = [...unlockedAchievements, ...newAchievements];
    localStorage.setItem(storageKey, JSON.stringify(allAchievements));
  }

  return newAchievements;
};

// Get user's unlocked achievements
export const getUserAchievements = (telegramId: string): StepAchievement[] => {
  const storageKey = `achievements_${telegramId}`;
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
};

// Simulate step counting (for demo purposes)
export const simulateStepCounting = (telegramId: string): void => {
  const interval = setInterval(() => {
    // Add 1-5 random steps every few seconds
    const randomSteps = Math.floor(Math.random() * 5) + 1;
    const current = getTodaySteps(telegramId);

    if (current.steps < 25000) {
      // Don't go too crazy
      addSteps(telegramId, randomSteps);
    } else {
      clearInterval(interval);
    }
  }, 3000); // Every 3 seconds

  // Clear after 5 minutes to prevent endless counting
  setTimeout(() => clearInterval(interval), 300000);
};

// Add sample step data for testing
// Get weekly step statistics (compatible interface for analytics)
export const getWeeklyStepStats = (telegramId: string) => {
  const insights = getStepInsights(telegramId);

  return {
    weeklyAverage: insights.weeklyAverage,
    currentStreak: insights.longestStreak.current,
    bestStreak: insights.longestStreak.best,
    consistencyScore: insights.trends.consistencyScore,
    weeklyPattern: insights.weeklyPattern,
    trend: insights.trends.stepstrend,
    healthMetrics: insights.healthMetrics,
  };
};

export const addSampleStepData = (
  telegramId: string,
  userHeight: number = 170,
  userWeight: number = 70,
): void => {
  const today = getTodaySteps(telegramId);
  if (today.steps > 0) return; // Don't add if data already exists

  // Add realistic step data for last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    const storageKey = `steps_${telegramId}_${dateKey}`;
    const existing = localStorage.getItem(storageKey);

    if (!existing) {
      // Generate realistic step data
      const baseSteps = 8000 + Math.floor(Math.random() * 6000); // 8k-14k steps
      const steps = i === 0 ? 5420 : baseSteps; // Today starts lower for demo
      const distance = calculateDistance(steps, userHeight);
      const calories = calculateCaloriesFromSteps(steps, userWeight);
      const activeMinutes = calculateActiveMinutes(steps);

      const sampleSession: StepSession = {
        id: `sample_${dateKey}`,
        date: dateKey,
        steps,
        distance,
        calories,
        activeMinutes,
        timestamp: date.toISOString(),
        activities: [
          {
            id: `activity_${dateKey}_1`,
            type: "walking",
            startTime: `${date.toISOString().split("T")[0]}T09:00:00Z`,
            endTime: `${date.toISOString().split("T")[0]}T09:30:00Z`,
            steps: Math.floor(steps * 0.3),
            distance: distance * 0.3,
            pace: 12, // min/km
            calories: calories * 0.3,
            location: "Morning walk",
          },
          {
            id: `activity_${dateKey}_2`,
            type: "walking",
            startTime: `${date.toISOString().split("T")[0]}T18:00:00Z`,
            endTime: `${date.toISOString().split("T")[0]}T19:00:00Z`,
            steps: Math.floor(steps * 0.4),
            distance: distance * 0.4,
            pace: 10, // min/km
            calories: calories * 0.4,
            location: "Evening walk",
          },
        ],
      };

      localStorage.setItem(storageKey, JSON.stringify(sampleSession));
    }
  }
};

// Get step challenges
export const getActiveStepChallenges = (
  telegramId: string,
): StepChallenge[] => {
  const storageKey = `stepChallenges_${telegramId}`;
  const challenges: StepChallenge[] = JSON.parse(
    localStorage.getItem(storageKey) || "[]",
  );

  // Filter active challenges
  const now = new Date().toISOString();
  return challenges.filter((c) => c.endDate > now && !c.isCompleted);
};

// Create default challenges
export const createDefaultChallenges = (telegramId: string): void => {
  const storageKey = `stepChallenges_${telegramId}`;
  const existing = localStorage.getItem(storageKey);

  if (existing) return; // Don't create if already exists

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const defaultChallenges: StepChallenge[] = [
    {
      id: "daily_10k",
      title: "Kunlik 10K",
      description: "Bugun 10,000 qadam tashlang",
      type: "daily",
      target: 10000,
      unit: "steps",
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      progress: 0,
      isCompleted: false,
      reward: { points: 50, badge: "🎯" },
      participants: 1247,
    },
    {
      id: "weekly_70k",
      title: "Haftalik 70K",
      description: "Bu haftada 70,000 qadam tashlang",
      type: "weekly",
      target: 70000,
      unit: "steps",
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      progress: 0,
      isCompleted: false,
      reward: { points: 200, badge: "🏆", title: "Haftalik Champion" },
      participants: 856,
    },
    {
      id: "distance_challenge",
      title: "100km Challenge",
      description: "Bu oyda 100km masofa bosib o'ting",
      type: "monthly",
      target: 100,
      unit: "distance",
      startDate: now.toISOString(),
      endDate: nextMonth.toISOString(),
      progress: 0,
      isCompleted: false,
      reward: { points: 500, badge: "🌟", title: "Distance Master" },
      participants: 342,
    },
  ];

  localStorage.setItem(storageKey, JSON.stringify(defaultChallenges));
};

// Update challenge progress
export const updateChallengeProgress = (telegramId: string): void => {
  const challenges = getActiveStepChallenges(telegramId);
  const insights = getStepInsights(telegramId);
  const todaySteps = getTodaySteps(telegramId);

  const updatedChallenges = challenges.map((challenge) => {
    let progress = 0;

    switch (challenge.type) {
      case "daily":
        if (challenge.unit === "steps") {
          progress = todaySteps.steps;
        } else if (challenge.unit === "distance") {
          progress = todaySteps.distance;
        }
        break;

      case "weekly":
        if (challenge.unit === "steps") {
          progress = insights.weeklyAverage * 7; // rough estimate
        }
        break;

      case "monthly":
        if (challenge.unit === "distance") {
          progress = insights.monthlyTotal * 0.0075; // rough conversion steps to km
        }
        break;
    }

    const isCompleted = progress >= challenge.target;

    return {
      ...challenge,
      progress: Math.min(progress, challenge.target),
      isCompleted,
    };
  });

  const storageKey = `stepChallenges_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedChallenges));
};
