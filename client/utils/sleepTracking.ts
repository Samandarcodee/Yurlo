import { UserProfile } from "@/contexts/UserContext";

// === SLEEP INTERFACES ===
export interface SleepSession {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  sleepDuration: number; // hours (calculated)
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
  deepSleep?: number; // hours
  lightSleep?: number; // hours
  remSleep?: number; // hours
  timesToWakeUp: number; // how many times woke up during night
  fellAsleepTime: number; // minutes to fall asleep
  notes?: string;
  mood: 1 | 2 | 3 | 4 | 5; // morning mood
  energyLevel: 1 | 2 | 3 | 4 | 5; // energy level after waking up
  timestamp: string;
}

export interface SleepGoals {
  targetBedTime: string; // HH:MM
  targetWakeTime: string; // HH:MM
  targetDuration: number; // hours
  consistencyGoal: number; // days per week to maintain schedule
}

export interface SleepInsights {
  averageDuration: number;
  averageQuality: number;
  averageFallAsleepTime: number;
  consistencyScore: number; // 0-100
  weeklyPattern: {
    day: string;
    avgBedTime: string;
    avgWakeTime: string;
    avgDuration: number;
    avgQuality: number;
  }[];
  recommendations: string[];
  trends: {
    durationTrend: 'improving' | 'declining' | 'stable';
    qualityTrend: 'improving' | 'declining' | 'stable';
    consistencyTrend: 'improving' | 'declining' | 'stable';
  };
}

// === UTILITY FUNCTIONS ===

// Get today's date
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Convert time string to minutes (for calculations)
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Calculate sleep duration between two times
const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
  let bedMinutes = timeToMinutes(bedTime);
  let wakeMinutes = timeToMinutes(wakeTime);
  
  // Handle overnight sleep (bed time is after midnight)
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60; // Add 24 hours
  }
  
  const durationMinutes = wakeMinutes - bedMinutes;
  return Math.round((durationMinutes / 60) * 100) / 100; // Round to 2 decimal places
};

// Get sleep goals for user
export const getSleepGoals = (telegramId: string): SleepGoals => {
  const storageKey = `sleepGoals_${telegramId}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing sleep goals:', error);
    }
  }
  
  // Default sleep goals
  const defaultGoals: SleepGoals = {
    targetBedTime: "23:00",
    targetWakeTime: "07:00",
    targetDuration: 8,
    consistencyGoal: 7, // 7 days per week
  };
  
  localStorage.setItem(storageKey, JSON.stringify(defaultGoals));
  return defaultGoals;
};

// Update sleep goals
export const updateSleepGoals = (telegramId: string, goals: Partial<SleepGoals>): SleepGoals => {
  const current = getSleepGoals(telegramId);
  const updated = { ...current, ...goals };
  
  const storageKey = `sleepGoals_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  
  return updated;
};

// Get today's sleep session
export const getTodaySleep = (telegramId: string): SleepSession | null => {
  const todayKey = getTodayKey();
  const storageKey = `sleep_${telegramId}_${todayKey}`;
  
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error('Error parsing sleep data:', error);
    }
  }
  
  return null;
};

// Add or update sleep session
export const updateSleepSession = (telegramId: string, session: Partial<SleepSession>): SleepSession => {
  const todayKey = getTodayKey();
  const storageKey = `sleep_${telegramId}_${todayKey}`;
  
  const existing = getTodaySleep(telegramId);
  
  let sleepSession: SleepSession;
  
  if (existing) {
    sleepSession = { ...existing, ...session };
  } else {
    sleepSession = {
      id: Date.now().toString(),
      date: todayKey,
      bedTime: session.bedTime || "23:00",
      wakeTime: session.wakeTime || "07:00",
      sleepDuration: 0,
      sleepQuality: session.sleepQuality || 3,
      timesToWakeUp: session.timesToWakeUp || 0,
      fellAsleepTime: session.fellAsleepTime || 15,
      mood: session.mood || 3,
      energyLevel: session.energyLevel || 3,
      timestamp: new Date().toISOString(),
      ...session,
    };
  }
  
  // Calculate duration if both times are provided
  if (sleepSession.bedTime && sleepSession.wakeTime) {
    sleepSession.sleepDuration = calculateSleepDuration(sleepSession.bedTime, sleepSession.wakeTime);
  }
  
  localStorage.setItem(storageKey, JSON.stringify(sleepSession));
  return sleepSession;
};

// Get sleep sessions for last N days
export const getSleepHistory = (telegramId: string, days: number = 30): SleepSession[] => {
  const sessions: SleepSession[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `sleep_${telegramId}_${dateKey}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        const session = JSON.parse(data) as SleepSession;
        sessions.push(session);
      } catch (error) {
        console.error('Error parsing sleep session:', error);
      }
    }
  }
  
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get sleep insights and analytics
export const getSleepInsights = (telegramId: string): SleepInsights => {
  const history = getSleepHistory(telegramId, 30);
  const last7Days = getSleepHistory(telegramId, 7);
  
  if (history.length === 0) {
    return {
      averageDuration: 0,
      averageQuality: 0,
      averageFallAsleepTime: 0,
      consistencyScore: 0,
      weeklyPattern: [],
      recommendations: ['Uyqu ma\'lumotlarini kiritishni boshlang'],
      trends: {
        durationTrend: 'stable',
        qualityTrend: 'stable',
        consistencyTrend: 'stable',
      },
    };
  }
  
  // Calculate averages
  const averageDuration = history.reduce((sum, s) => sum + s.sleepDuration, 0) / history.length;
  const averageQuality = history.reduce((sum, s) => sum + s.sleepQuality, 0) / history.length;
  const averageFallAsleepTime = history.reduce((sum, s) => sum + s.fellAsleepTime, 0) / history.length;
  
  // Calculate consistency score
  const goals = getSleepGoals(telegramId);
  const targetBedMinutes = timeToMinutes(goals.targetBedTime);
  const targetWakeMinutes = timeToMinutes(goals.targetWakeTime);
  
  let consistencyPoints = 0;
  let maxPoints = 0;
  
  last7Days.forEach(session => {
    const bedMinutes = timeToMinutes(session.bedTime);
    const wakeMinutes = timeToMinutes(session.wakeTime);
    
    maxPoints += 100;
    
    // Bed time consistency (±30 minutes = full points)
    const bedDiff = Math.abs(bedMinutes - targetBedMinutes);
    const bedPoints = Math.max(0, 50 - bedDiff);
    
    // Wake time consistency (±30 minutes = full points)
    const wakeDiff = Math.abs(wakeMinutes - targetWakeMinutes);
    const wakePoints = Math.max(0, 50 - wakeDiff);
    
    consistencyPoints += bedPoints + wakePoints;
  });
  
  const consistencyScore = maxPoints > 0 ? Math.round((consistencyPoints / maxPoints) * 100) : 0;
  
  // Weekly pattern
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyPattern = dayNames.map(day => {
    const daySessions = history.filter(s => {
      const sessionDay = new Date(s.date).getDay();
      return dayNames[sessionDay] === day;
    });
    
    if (daySessions.length === 0) {
      return {
        day,
        avgBedTime: '00:00',
        avgWakeTime: '00:00',
        avgDuration: 0,
        avgQuality: 0,
      };
    }
    
    const avgBedMinutes = daySessions.reduce((sum, s) => sum + timeToMinutes(s.bedTime), 0) / daySessions.length;
    const avgWakeMinutes = daySessions.reduce((sum, s) => sum + timeToMinutes(s.wakeTime), 0) / daySessions.length;
    const avgDuration = daySessions.reduce((sum, s) => sum + s.sleepDuration, 0) / daySessions.length;
    const avgQuality = daySessions.reduce((sum, s) => sum + s.sleepQuality, 0) / daySessions.length;
    
    return {
      day,
      avgBedTime: minutesToTime(Math.round(avgBedMinutes)),
      avgWakeTime: minutesToTime(Math.round(avgWakeMinutes)),
      avgDuration: Math.round(avgDuration * 100) / 100,
      avgQuality: Math.round(avgQuality * 100) / 100,
    };
  });
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageDuration < 7) {
    recommendations.push('Uyqu vaqtingizni oshiring - kamida 7-8 soat uxlashga harakat qiling');
  }
  
  if (averageQuality < 3) {
    recommendations.push('Uyqu sifatini yaxshilash uchun uyqu muhitini optimallashtiring');
  }
  
  if (averageFallAsleepTime > 30) {
    recommendations.push('Uxlashdan oldin meditatsiya yoki kitob o\'qing - tez uxlash uchun');
  }
  
  if (consistencyScore < 70) {
    recommendations.push('Uyqu jadvalingizni barqarorlashtiring - har kuni bir xil vaqtda yoting va turing');
  }
  
  const recentQuality = last7Days.length > 0 ? last7Days.reduce((sum, s) => sum + s.sleepQuality, 0) / last7Days.length : 0;
  if (recentQuality > averageQuality) {
    recommendations.push('Yaxshi! Uyqu sifatingiz yaxshilanmoqda. Davom eting!');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Uyqu sifatingiz yaxshi! Joriy jadvalingizni davom ettiring.');
  }
  
  // Calculate trends (simple implementation)
  const firstHalf = history.slice(Math.floor(history.length / 2));
  const secondHalf = history.slice(0, Math.floor(history.length / 2));
  
  const firstHalfDuration = firstHalf.reduce((sum, s) => sum + s.sleepDuration, 0) / firstHalf.length || 0;
  const secondHalfDuration = secondHalf.reduce((sum, s) => sum + s.sleepDuration, 0) / secondHalf.length || 0;
  
  const firstHalfQuality = firstHalf.reduce((sum, s) => sum + s.sleepQuality, 0) / firstHalf.length || 0;
  const secondHalfQuality = secondHalf.reduce((sum, s) => sum + s.sleepQuality, 0) / secondHalf.length || 0;
  
  const durationTrend = secondHalfDuration > firstHalfDuration + 0.2 ? 'improving' 
                      : secondHalfDuration < firstHalfDuration - 0.2 ? 'declining' 
                      : 'stable';
  
  const qualityTrend = secondHalfQuality > firstHalfQuality + 0.3 ? 'improving' 
                     : secondHalfQuality < firstHalfQuality - 0.3 ? 'declining' 
                     : 'stable';
  
  return {
    averageDuration: Math.round(averageDuration * 100) / 100,
    averageQuality: Math.round(averageQuality * 100) / 100,
    averageFallAsleepTime: Math.round(averageFallAsleepTime),
    consistencyScore,
    weeklyPattern,
    recommendations,
    trends: {
      durationTrend,
      qualityTrend,
      consistencyTrend: consistencyScore > 80 ? 'improving' : consistencyScore < 50 ? 'declining' : 'stable',
    },
  };
};

// Add sample sleep data for testing
export const addSampleSleepData = (telegramId: string): void => {
  const today = getTodaySleep(telegramId);
  if (today) return; // Don't add if data already exists
  
  // Add sample data for last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `sleep_${telegramId}_${dateKey}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      // Generate realistic sample data
      const bedHour = 22 + Math.floor(Math.random() * 3); // 22:00 - 01:00
      const bedMinute = Math.floor(Math.random() * 60);
      const wakeHour = 6 + Math.floor(Math.random() * 3); // 06:00 - 09:00
      const wakeMinute = Math.floor(Math.random() * 60);
      
      const bedTime = `${bedHour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`;
      const wakeTime = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
      
      const sampleSession: SleepSession = {
        id: `sample_${dateKey}`,
        date: dateKey,
        bedTime,
        wakeTime,
        sleepDuration: calculateSleepDuration(bedTime, wakeTime),
        sleepQuality: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5, // 3-5
        timesToWakeUp: Math.floor(Math.random() * 3),
        fellAsleepTime: 10 + Math.floor(Math.random() * 20), // 10-30 minutes
        mood: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5,
        energyLevel: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5,
        timestamp: date.toISOString(),
        notes: i === 0 ? 'Sample sleep data for testing' : undefined,
      };
      
      localStorage.setItem(storageKey, JSON.stringify(sampleSession));
    }
  }
};

// Check if it's bedtime (within 30 minutes of target)
export const isBedtimeReminder = (telegramId: string): boolean => {
  const goals = getSleepGoals(telegramId);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = timeToMinutes(goals.targetBedTime);
  
  // Check if within 30 minutes before target bedtime
  const diff = targetMinutes - currentMinutes;
  return diff >= 0 && diff <= 30;
};

// Get sleep quality description
export const getSleepQualityDescription = (quality: number): string => {
  switch (quality) {
    case 1: return 'Juda yomon';
    case 2: return 'Yomon';
    case 3: return 'O\'rtacha';
    case 4: return 'Yaxshi';
    case 5: return 'A\'lo';
    default: return 'Noma\'lum';
  }
};

// Calculate sleep score (0-100)
export const calculateSleepScore = (session: SleepSession, goals: SleepGoals): number => {
  let score = 0;
  
  // Duration score (40 points max)
  const durationDiff = Math.abs(session.sleepDuration - goals.targetDuration);
  const durationScore = Math.max(0, 40 - (durationDiff * 10));
  score += durationScore;
  
  // Quality score (30 points max)
  const qualityScore = (session.sleepQuality / 5) * 30;
  score += qualityScore;
  
  // Timing score (20 points max)
  const bedTimeDiff = Math.abs(timeToMinutes(session.bedTime) - timeToMinutes(goals.targetBedTime));
  const timingScore = Math.max(0, 20 - (bedTimeDiff / 60) * 10);
  score += timingScore;
  
  // Fall asleep time score (10 points max)
  const fallAsleepScore = Math.max(0, 10 - (session.fellAsleepTime / 60) * 10);
  score += fallAsleepScore;
  
  return Math.round(Math.max(0, Math.min(100, score)));
};