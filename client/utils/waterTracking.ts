import { UserProfile } from "@/contexts/UserContext";

// === INTERFACES ===
export interface WaterSession {
  id: string;
  date: string; // YYYY-MM-DD
  totalIntake: number; // glasses
  totalVolume: number; // ml
  entries: WaterEntry[];
  goal: number; // glasses
  goalReached: boolean;
  timestamp: string;
  reminders: WaterReminder[];
  quality: {
    temperature: 'cold' | 'room' | 'warm';
    source: 'tap' | 'bottled' | 'filtered' | 'mineral';
    additives?: string[]; // lemon, mint, etc.
  };
}

export interface WaterEntry {
  id: string;
  amount: number; // glasses (0.25, 0.5, 1, etc.)
  volume: number; // ml
  timestamp: string;
  type: 'water' | 'tea' | 'coffee' | 'juice' | 'smoothie' | 'other';
  temperature: 'cold' | 'room' | 'warm' | 'hot';
  notes?: string;
  location?: string;
  mood?: 'thirsty' | 'routine' | 'exercise' | 'meal';
}

export interface WaterReminder {
  id: string;
  time: string; // HH:MM
  message: string;
  isActive: boolean;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: string[]; // ['monday', 'wednesday', 'friday']
}

export interface WaterGoals {
  dailyGlasses: number;
  dailyVolume: number; // ml
  wakeUpReminder: boolean;
  mealReminders: boolean;
  exerciseReminder: boolean;
  bedtimeReminder: boolean;
  intervalReminders: {
    enabled: boolean;
    interval: number; // minutes
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  };
}

export interface WaterInsights {
  dailyAverage: number; // glasses
  weeklyAverage: number;
  monthlyTotal: number;
  bestDay: {
    date: string;
    glasses: number;
  };
  streak: {
    current: number; // days of meeting goal
    best: number;
  };
  patterns: {
    morningIntake: number; // average glasses 6-12
    afternoonIntake: number; // 12-18
    eveningIntake: number; // 18-22
    peakHour: string; // most active drinking hour
  };
  hydrationLevel: {
    excellent: number; // days percentage
    good: number;
    moderate: number;
    poor: number;
  };
  trends: {
    intakeTrend: 'increasing' | 'decreasing' | 'stable';
    consistencyScore: number; // 0-100
  };
  recommendations: string[];
  healthBenefits: {
    skinHealth: number; // 0-100 score
    energyLevel: number;
    detoxification: number;
    weightManagement: number;
  };
}

export interface WaterChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // glasses or days
  unit: 'glasses' | 'days' | 'volume';
  startDate: string;
  endDate: string;
  progress: number;
  isCompleted: boolean;
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  participants?: number;
}

// === UTILITY FUNCTIONS ===

// Standard glass size in ml
const GLASS_SIZE_ML = 250;

// Get today's date key
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Convert glasses to ml
export const glassesToMl = (glasses: number): number => {
  return Math.round(glasses * GLASS_SIZE_ML);
};

// Convert ml to glasses
export const mlToGlasses = (ml: number): number => {
  return Math.round((ml / GLASS_SIZE_ML) * 4) / 4; // Round to nearest 0.25
};

// Calculate recommended daily water intake based on user data
export const calculateWaterGoal = (user: UserProfile): number => {
  const weight = parseFloat(user.weight);
  const activityLevel = user.activityLevel;
  
  // Base calculation: 30-35ml per kg of body weight
  let baseIntake = weight * 32; // ml
  
  // Adjust for activity level
  const activityMultiplier = {
    low: 1.0,
    medium: 1.2,
    high: 1.4,
  };
  
  const multiplier = activityMultiplier[activityLevel as keyof typeof activityMultiplier] || 1.0;
  const totalIntake = baseIntake * multiplier;
  
  // Convert to glasses and round to nearest 0.5
  const glasses = Math.round((totalIntake / GLASS_SIZE_ML) * 2) / 2;
  
  // Ensure reasonable range (6-12 glasses)
  return Math.max(6, Math.min(12, glasses));
};

// Get or create today's water session
export const getTodayWater = (telegramId: string): WaterSession => {
  const todayKey = getTodayKey();
  const storageKey = `water_${telegramId}_${todayKey}`;
  
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error('Error parsing water data:', error);
    }
  }
  
  // Create new session
  const defaultGoal = 8; // glasses
  const newSession: WaterSession = {
    id: Date.now().toString(),
    date: todayKey,
    totalIntake: 0,
    totalVolume: 0,
    entries: [],
    goal: defaultGoal,
    goalReached: false,
    timestamp: new Date().toISOString(),
    reminders: [],
    quality: {
      temperature: 'room',
      source: 'filtered',
    },
  };
  
  localStorage.setItem(storageKey, JSON.stringify(newSession));
  return newSession;
};

// Update today's water session
export const updateTodayWater = (
  telegramId: string, 
  updates: Partial<WaterSession>
): WaterSession => {
  const current = getTodayWater(telegramId);
  const updated = { ...current, ...updates, timestamp: new Date().toISOString() };
  
  const todayKey = getTodayKey();
  const storageKey = `water_${telegramId}_${todayKey}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  
  return updated;
};

// Add water entry
export const addWaterEntry = (
  telegramId: string,
  amount: number,
  type: WaterEntry['type'] = 'water',
  temperature: WaterEntry['temperature'] = 'room',
  notes?: string
): WaterSession => {
  const current = getTodayWater(telegramId);
  
  const newEntry: WaterEntry = {
    id: Date.now().toString(),
    amount,
    volume: glassesToMl(amount),
    timestamp: new Date().toISOString(),
    type,
    temperature,
    notes,
    mood: 'routine',
  };
  
  const updatedEntries = [...current.entries, newEntry];
  const totalIntake = updatedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalVolume = updatedEntries.reduce((sum, entry) => sum + entry.volume, 0);
  const goalReached = totalIntake >= current.goal;
  
  return updateTodayWater(telegramId, {
    entries: updatedEntries,
    totalIntake: Math.round(totalIntake * 4) / 4, // Round to nearest 0.25
    totalVolume: Math.round(totalVolume),
    goalReached,
  });
};

// Get water goals
export const getWaterGoals = (telegramId: string): WaterGoals => {
  const storageKey = `waterGoals_${telegramId}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing water goals:', error);
    }
  }
  
  // Default goals
  const defaultGoals: WaterGoals = {
    dailyGlasses: 8,
    dailyVolume: 2000, // ml
    wakeUpReminder: true,
    mealReminders: true,
    exerciseReminder: true,
    bedtimeReminder: false,
    intervalReminders: {
      enabled: true,
      interval: 60, // every hour
      startTime: "08:00",
      endTime: "22:00",
    },
  };
  
  localStorage.setItem(storageKey, JSON.stringify(defaultGoals));
  return defaultGoals;
};

// Update water goals
export const updateWaterGoals = (telegramId: string, goals: Partial<WaterGoals>): WaterGoals => {
  const current = getWaterGoals(telegramId);
  const updated = { ...current, ...goals };
  
  const storageKey = `waterGoals_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  
  return updated;
};

// Get water history
export const getWaterHistory = (telegramId: string, days: number = 30): WaterSession[] => {
  const sessions: WaterSession[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `water_${telegramId}_${dateKey}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        const session = JSON.parse(data) as WaterSession;
        sessions.push(session);
      } catch (error) {
        console.error('Error parsing water session:', error);
      }
    }
  }
  
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get water insights
export const getWaterInsights = (telegramId: string): WaterInsights => {
  const history = getWaterHistory(telegramId, 30);
  const last7Days = getWaterHistory(telegramId, 7);
  
  if (history.length === 0) {
    return {
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyTotal: 0,
      bestDay: { date: '', glasses: 0 },
      streak: { current: 0, best: 0 },
      patterns: {
        morningIntake: 0,
        afternoonIntake: 0,
        eveningIntake: 0,
        peakHour: '09:00',
      },
      hydrationLevel: {
        excellent: 0,
        good: 0,
        moderate: 0,
        poor: 0,
      },
      trends: {
        intakeTrend: 'stable',
        consistencyScore: 0,
      },
      recommendations: ['Suv ichishni boshlang!'],
      healthBenefits: {
        skinHealth: 0,
        energyLevel: 0,
        detoxification: 0,
        weightManagement: 0,
      },
    };
  }
  
  // Calculate averages
  const dailyAverage = history.reduce((sum, s) => sum + s.totalIntake, 0) / history.length;
  const weeklyAverage = last7Days.length > 0 
    ? last7Days.reduce((sum, s) => sum + s.totalIntake, 0) / last7Days.length
    : dailyAverage;
  const monthlyTotal = history.reduce((sum, s) => sum + s.totalIntake, 0);
  
  // Find best day
  const bestDay = history.reduce((best, current) => 
    current.totalIntake > best.glasses ? { date: current.date, glasses: current.totalIntake } : best,
    { date: '', glasses: 0 }
  );
  
  // Calculate streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Sort by date ascending for streak calculation
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].goalReached) {
      tempStreak++;
      if (i === sortedHistory.length - 1) { // Most recent day
        currentStreak = tempStreak;
      }
    } else {
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      if (i === sortedHistory.length - 1) { // Most recent day failed
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }
  
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }
  
  // Calculate patterns (simplified)
  const morningEntries = history.flatMap(s => s.entries.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 6 && hour < 12;
  }));
  
  const afternoonEntries = history.flatMap(s => s.entries.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 12 && hour < 18;
  }));
  
  const eveningEntries = history.flatMap(s => s.entries.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 18 && hour < 22;
  }));
  
  const morningIntake = morningEntries.reduce((sum, e) => sum + e.amount, 0) / history.length;
  const afternoonIntake = afternoonEntries.reduce((sum, e) => sum + e.amount, 0) / history.length;
  const eveningIntake = eveningEntries.reduce((sum, e) => sum + e.amount, 0) / history.length;
  
  // Find peak hour
  const hourCounts: Record<number, number> = {};
  history.forEach(session => {
    session.entries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + entry.amount;
    });
  });
  
  const peakHour = Object.entries(hourCounts).reduce((peak, [hour, amount]) => 
    amount > peak.amount ? { hour: parseInt(hour), amount } : peak,
    { hour: 9, amount: 0 }
  ).hour;
  
  // Calculate hydration levels
  const excellentDays = history.filter(s => s.totalIntake >= s.goal * 1.2).length;
  const goodDays = history.filter(s => s.totalIntake >= s.goal && s.totalIntake < s.goal * 1.2).length;
  const moderateDays = history.filter(s => s.totalIntake >= s.goal * 0.7 && s.totalIntake < s.goal).length;
  const poorDays = history.filter(s => s.totalIntake < s.goal * 0.7).length;
  
  const hydrationLevel = {
    excellent: Math.round((excellentDays / history.length) * 100),
    good: Math.round((goodDays / history.length) * 100),
    moderate: Math.round((moderateDays / history.length) * 100),
    poor: Math.round((poorDays / history.length) * 100),
  };
  
  // Calculate trends
  const firstHalf = history.slice(Math.floor(history.length / 2));
  const secondHalf = history.slice(0, Math.floor(history.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.totalIntake, 0) / firstHalf.length || 0;
  const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.totalIntake, 0) / secondHalf.length || 0;
  
  const intakeChange = secondHalfAvg - firstHalfAvg;
  const intakeChangePercent = firstHalfAvg > 0 ? (intakeChange / firstHalfAvg) * 100 : 0;
  
  const intakeTrend = intakeChangePercent > 10 ? 'increasing' 
                   : intakeChangePercent < -10 ? 'decreasing' 
                   : 'stable';
  
  // Consistency score
  const daysWithGoalMet = history.filter(s => s.goalReached).length;
  const consistencyScore = Math.round((daysWithGoalMet / history.length) * 100);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (dailyAverage < 6) {
    recommendations.push('Suv ichish miqdorini oshiring - kamida 6-8 stakan suv ichi');
  }
  
  if (morningIntake < 2) {
    recommendations.push('Ertalab ko\'proq suv iching - uyg\'ongandan keyin 1-2 stakan');
  }
  
  if (currentStreak === 0) {
    recommendations.push('Yangi streak boshlang - bugun maqsadga erishing!');
  }
  
  if (consistencyScore < 70) {
    recommendations.push('Muntazam suv ichish rejimini yarating');
  }
  
  if (eveningIntake > afternoonIntake + morningIntake) {
    recommendations.push('Kechqurun kamroq, kun davomida ko\'proq suv iching');
  }
  
  if (hydrationLevel.poor > 30) {
    recommendations.push('Gidratatsiya darajangizni yaxshilash kerak');
  }
  
  // Health benefits calculation
  const skinHealth = Math.min(100, Math.round((dailyAverage / 8) * 100));
  const energyLevel = Math.min(100, Math.round(((dailyAverage / 8) * 80) + (consistencyScore * 0.2)));
  const detoxification = Math.min(100, Math.round((dailyAverage / 10) * 100));
  const weightManagement = Math.min(100, Math.round(((dailyAverage / 8) * 60) + (consistencyScore * 0.4)));
  
  return {
    dailyAverage: Math.round(dailyAverage * 4) / 4,
    weeklyAverage: Math.round(weeklyAverage * 4) / 4,
    monthlyTotal: Math.round(monthlyTotal * 4) / 4,
    bestDay,
    streak: { current: currentStreak, best: bestStreak },
    patterns: {
      morningIntake: Math.round(morningIntake * 4) / 4,
      afternoonIntake: Math.round(afternoonIntake * 4) / 4,
      eveningIntake: Math.round(eveningIntake * 4) / 4,
      peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
    },
    hydrationLevel,
    trends: { intakeTrend, consistencyScore },
    recommendations,
    healthBenefits: {
      skinHealth,
      energyLevel,
      detoxification,
      weightManagement,
    },
  };
};

// Add sample water data
export const addSampleWaterData = (telegramId: string, userGoal: number = 8): void => {
  const today = getTodayWater(telegramId);
  if (today.totalIntake > 0) return; // Don't add if data already exists
  
  // Add realistic water data for last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `water_${telegramId}_${dateKey}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      // Generate realistic water intake (6-10 glasses)
      const targetIntake = i === 0 ? 5.75 : 6 + Math.random() * 4; // Today starts lower for demo
      const glasses = Math.round(targetIntake * 4) / 4; // Round to 0.25
      
      const entries: WaterEntry[] = [];
      let currentIntake = 0;
      
      // Morning entries
      for (let j = 0; j < 3 && currentIntake < glasses; j++) {
        const amount = 0.5 + Math.random() * 0.5; // 0.5-1 glass
        const adjustedAmount = Math.min(amount, glasses - currentIntake);
        if (adjustedAmount > 0) {
          entries.push({
            id: `${dateKey}_${j}`,
            amount: Math.round(adjustedAmount * 4) / 4,
            volume: glassesToMl(adjustedAmount),
            timestamp: `${dateKey}T${(8 + j * 2).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`,
            type: j === 0 ? 'water' : (Math.random() > 0.7 ? 'tea' : 'water'),
            temperature: 'room',
            mood: j === 0 ? 'routine' : 'thirsty',
          });
          currentIntake += adjustedAmount;
        }
      }
      
      // Afternoon/Evening entries
      while (currentIntake < glasses && entries.length < 8) {
        const amount = 0.25 + Math.random() * 0.75; // 0.25-1 glass
        const adjustedAmount = Math.min(amount, glasses - currentIntake);
        if (adjustedAmount > 0) {
          const hour = 14 + Math.floor(Math.random() * 6); // 14-19
          entries.push({
            id: `${dateKey}_${entries.length}`,
            amount: Math.round(adjustedAmount * 4) / 4,
            volume: glassesToMl(adjustedAmount),
            timestamp: `${dateKey}T${hour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`,
            type: Math.random() > 0.8 ? 'tea' : 'water',
            temperature: 'room',
            mood: 'routine',
          });
          currentIntake += adjustedAmount;
        }
      }
      
      const sampleSession: WaterSession = {
        id: `sample_${dateKey}`,
        date: dateKey,
        totalIntake: Math.round(currentIntake * 4) / 4,
        totalVolume: glassesToMl(currentIntake),
        entries,
        goal: userGoal,
        goalReached: currentIntake >= userGoal,
        timestamp: date.toISOString(),
        reminders: [],
        quality: {
          temperature: 'room',
          source: 'filtered',
        },
      };
      
      localStorage.setItem(storageKey, JSON.stringify(sampleSession));
    }
  }
};

// Quick water amounts
export const QUICK_WATER_AMOUNTS = [
  { amount: 0.25, label: '1/4', icon: '🥃' },
  { amount: 0.5, label: '1/2', icon: '🥛' },
  { amount: 1, label: '1', icon: '🍶' },
  { amount: 1.5, label: '1.5', icon: '💧' },
];

// Water types
export const WATER_TYPES = [
  { type: 'water' as const, label: 'Suv', icon: '💧' },
  { type: 'tea' as const, label: 'Choy', icon: '🍵' },
  { type: 'coffee' as const, label: 'Qahva', icon: '☕' },
  { type: 'juice' as const, label: 'Sharbat', icon: '🧃' },
  { type: 'smoothie' as const, label: 'Smoothie', icon: '🥤' },
  { type: 'other' as const, label: 'Boshqa', icon: '🥤' },
];

// Water reminders
export const createWaterReminders = (telegramId: string): void => {
  const goals = getWaterGoals(telegramId);
  
  const defaultReminders: WaterReminder[] = [
    {
      id: 'wakeup',
      time: '07:00',
      message: 'Xayrli tong! Birinchi stakan suv ichish vaqti 💧',
      isActive: goals.wakeUpReminder,
      frequency: 'daily',
    },
    {
      id: 'mid_morning',
      time: '10:00',
      message: 'Ertalabki suv vaqti! ☀️',
      isActive: goals.intervalReminders.enabled,
      frequency: 'daily',
    },
    {
      id: 'lunch',
      time: '12:00',
      message: 'Tushlik oldidan suv iching 🍽️',
      isActive: goals.mealReminders,
      frequency: 'daily',
    },
    {
      id: 'afternoon',
      time: '15:00',
      message: 'Tushdan keyin gidratatsiya vaqti! 💪',
      isActive: goals.intervalReminders.enabled,
      frequency: 'daily',
    },
    {
      id: 'evening',
      time: '18:00',
      message: 'Kechki suv eslatmasi 🌅',
      isActive: goals.intervalReminders.enabled,
      frequency: 'daily',
    },
  ];
  
  const storageKey = `waterReminders_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(defaultReminders));
};

// Check if it's time for water reminder
export const checkWaterReminders = (telegramId: string): WaterReminder[] => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const storageKey = `waterReminders_${telegramId}`;
  const reminders: WaterReminder[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  return reminders.filter(reminder => 
    reminder.isActive && 
    reminder.time === currentTime
  );
};