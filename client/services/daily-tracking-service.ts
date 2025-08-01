/**
 * Comprehensive Daily Tracking Service
 * Handles all daily user data collection with Telegram integration
 */

import TelegramUserService, { DailyTrackingData } from './telegram-user-service';

export interface DailyMetrics {
  date: string;
  
  // Basic vitals
  weight?: number;
  bodyFat?: number;
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'excellent';
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  
  // Sleep tracking
  sleep: {
    bedtime?: string;
    wakeTime?: string;
    hoursSlept?: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
    disturbances?: string[];
  };
  
  // Activity tracking
  steps: {
    count: number;
    target: number;
    distance?: number; // km
    activeMinutes?: number;
    caloriesBurned?: number;
  };
  
  // Water intake
  water: {
    glasses: number;
    target: number;
    totalMl?: number;
  };
  
  // Exercise
  exercise?: {
    type: string;
    duration: number; // minutes
    intensity: 'low' | 'moderate' | 'high';
    caloriesBurned?: number;
    notes?: string;
  }[];
  
  // Nutrition summary
  nutrition: {
    calories: { consumed: number; target: number; burned: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
    fiber: { consumed: number; target: number };
    meals: number;
    snacks: number;
  };
  
  // Symptoms & health
  symptoms?: string[];
  medications?: Array<{
    name: string;
    taken: boolean;
    time?: string;
  }>;
  
  // Notes
  notes?: string;
  
  // Completion status
  dataCompleteness: number; // percentage 0-100
  lastUpdated: string;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  
  // Averages
  averageWeight?: number;
  averageSleep: number;
  averageSteps: number;
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  
  // Totals
  totalCalories: number;
  totalExerciseMinutes: number;
  totalWaterGlasses: number;
  
  // Achievements
  daysWithGoalsMet: number;
  streakDays: number;
  
  // Progress
  weightChange?: number;
  improvementAreas: string[];
  achievements: string[];
}

export interface TrackingReminder {
  id: string;
  type: 'sleep' | 'weight' | 'mood' | 'water' | 'exercise' | 'medication' | 'custom';
  title: string;
  message: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  days?: string[]; // for weekly frequency
  enabled: boolean;
  lastSent?: string;
}

// === DAILY TRACKING SERVICE === //

class DailyTrackingService {
  private static instance: DailyTrackingService;
  private telegramService: TelegramUserService;

  constructor(telegramService: TelegramUserService) {
    this.telegramService = telegramService;
  }

  static getInstance(telegramService: TelegramUserService): DailyTrackingService {
    if (!DailyTrackingService.instance) {
      DailyTrackingService.instance = new DailyTrackingService(telegramService);
    }
    return DailyTrackingService.instance;
  }

  // === DAILY METRICS MANAGEMENT === //

  async getTodayMetrics(telegramId: string): Promise<DailyMetrics> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await this.getMetricsForDate(telegramId, today);
      
      if (existing) return existing;

      // Create new day metrics with defaults
      const defaultMetrics: DailyMetrics = {
        date: today,
        mood: 'okay',
        energy: 3,
        stress: 3,
        sleep: {
          quality: 'fair'
        },
        steps: {
          count: 0,
          target: 10000
        },
        water: {
          glasses: 0,
          target: 8
        },
        nutrition: {
          calories: { consumed: 0, target: 2000, burned: 0 },
          protein: { consumed: 0, target: 100 },
          carbs: { consumed: 0, target: 250 },
          fat: { consumed: 0, target: 67 },
          fiber: { consumed: 0, target: 25 },
          meals: 0,
          snacks: 0
        },
        dataCompleteness: 0,
        lastUpdated: new Date().toISOString()
      };

      await this.saveMetrics(telegramId, defaultMetrics);
      return defaultMetrics;
    } catch (error) {
      console.error('Error getting today metrics:', error);
      throw error;
    }
  }

  async getMetricsForDate(telegramId: string, date: string): Promise<DailyMetrics | null> {
    try {
      const key = `daily_metrics_${date}`;
      const data = await this.telegramService.cloudStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting metrics for date:', error);
      return null;
    }
  }

  async saveMetrics(telegramId: string, metrics: DailyMetrics): Promise<boolean> {
    try {
      // Calculate completeness
      metrics.dataCompleteness = this.calculateCompleteness(metrics);
      metrics.lastUpdated = new Date().toISOString();

      const key = `daily_metrics_${metrics.date}`;
      const success = await this.telegramService.cloudStorage.setItem(
        key, 
        JSON.stringify(metrics)
      );

      // Update streak if data is sufficiently complete
      if (metrics.dataCompleteness >= 70) {
        await this.updateTrackingStreak(telegramId);
      }

      return success;
    } catch (error) {
      console.error('Error saving metrics:', error);
      return false;
    }
  }

  private calculateCompleteness(metrics: DailyMetrics): number {
    let completed = 0;
    let total = 10; // Total trackable items

    // Basic vitals (3 points)
    if (metrics.mood !== 'okay') completed += 1; // Changed from default
    if (metrics.energy !== 3) completed += 1; // Changed from default
    if (metrics.stress !== 3) completed += 1; // Changed from default

    // Sleep (2 points)
    if (metrics.sleep.bedtime && metrics.sleep.wakeTime) completed += 1;
    if (metrics.sleep.quality !== 'fair') completed += 1; // Changed from default

    // Activity (2 points)
    if (metrics.steps.count > 0) completed += 1;
    if (metrics.exercise && metrics.exercise.length > 0) completed += 1;

    // Water (1 point)
    if (metrics.water.glasses > 0) completed += 1;

    // Nutrition (1 point)
    if (metrics.nutrition.meals > 0) completed += 1;

    // Weight (1 point)
    if (metrics.weight) completed += 1;

    return Math.round((completed / total) * 100);
  }

  // === SPECIFIC DATA UPDATES === //

  async updateSleepData(
    telegramId: string, 
    sleepData: DailyMetrics['sleep']
  ): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      metrics.sleep = { ...metrics.sleep, ...sleepData };
      
      // Calculate hours if both times provided
      if (metrics.sleep.bedtime && metrics.sleep.wakeTime) {
        const bedtime = new Date(`2000-01-01T${metrics.sleep.bedtime}:00`);
        const wakeTime = new Date(`2000-01-02T${metrics.sleep.wakeTime}:00`);
        metrics.sleep.hoursSlept = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);
      }

      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error updating sleep data:', error);
      return false;
    }
  }

  async updateStepsData(
    telegramId: string, 
    stepsData: Partial<DailyMetrics['steps']>
  ): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      metrics.steps = { ...metrics.steps, ...stepsData };
      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error updating steps data:', error);
      return false;
    }
  }

  async updateWaterIntake(
    telegramId: string, 
    waterData: Partial<DailyMetrics['water']>
  ): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      metrics.water = { ...metrics.water, ...waterData };
      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error updating water intake:', error);
      return false;
    }
  }

  async updateMoodAndEnergy(
    telegramId: string, 
    mood: DailyMetrics['mood'],
    energy: DailyMetrics['energy'],
    stress: DailyMetrics['stress']
  ): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      metrics.mood = mood;
      metrics.energy = energy;
      metrics.stress = stress;
      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error updating mood and energy:', error);
      return false;
    }
  }

  async addExercise(
    telegramId: string, 
    exercise: DailyMetrics['exercise'][0]
  ): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      if (!metrics.exercise) metrics.exercise = [];
      metrics.exercise.push(exercise);
      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error adding exercise:', error);
      return false;
    }
  }

  async updateWeight(telegramId: string, weight: number): Promise<boolean> {
    try {
      const metrics = await this.getTodayMetrics(telegramId);
      metrics.weight = weight;
      return await this.saveMetrics(telegramId, metrics);
    } catch (error) {
      console.error('Error updating weight:', error);
      return false;
    }
  }

  // === WEEKLY SUMMARIES === //

  async getWeeklySummary(telegramId: string, weekStartDate?: string): Promise<WeeklySummary> {
    try {
      const startDate = weekStartDate || this.getWeekStartDate();
      const endDate = this.getWeekEndDate(startDate);
      
      const weekMetrics: DailyMetrics[] = [];
      
      // Get 7 days of data
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMetrics = await this.getMetricsForDate(telegramId, dateStr);
        if (dayMetrics) weekMetrics.push(dayMetrics);
      }

      return this.calculateWeeklySummary(weekMetrics, startDate, endDate);
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      throw error;
    }
  }

  private calculateWeeklySummary(
    weekMetrics: DailyMetrics[], 
    startDate: string, 
    endDate: string
  ): WeeklySummary {
    const summary: WeeklySummary = {
      startDate,
      endDate,
      averageSleep: 0,
      averageSteps: 0,
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      totalCalories: 0,
      totalExerciseMinutes: 0,
      totalWaterGlasses: 0,
      daysWithGoalsMet: 0,
      streakDays: 0,
      improvementAreas: [],
      achievements: []
    };

    if (weekMetrics.length === 0) return summary;

    // Calculate averages
    const moodValues = { terrible: 1, bad: 2, okay: 3, good: 4, excellent: 5 };
    
    summary.averageSleep = weekMetrics.reduce((sum, m) => 
      sum + (m.sleep.hoursSlept || 0), 0) / weekMetrics.length;
    
    summary.averageSteps = weekMetrics.reduce((sum, m) => 
      sum + m.steps.count, 0) / weekMetrics.length;
    
    summary.averageMood = weekMetrics.reduce((sum, m) => 
      sum + moodValues[m.mood], 0) / weekMetrics.length;
    
    summary.averageEnergy = weekMetrics.reduce((sum, m) => 
      sum + m.energy, 0) / weekMetrics.length;
    
    summary.averageStress = weekMetrics.reduce((sum, m) => 
      sum + m.stress, 0) / weekMetrics.length;

    // Calculate totals
    summary.totalCalories = weekMetrics.reduce((sum, m) => 
      sum + m.nutrition.calories.consumed, 0);
    
    summary.totalExerciseMinutes = weekMetrics.reduce((sum, m) => 
      sum + (m.exercise?.reduce((exSum, ex) => exSum + ex.duration, 0) || 0), 0);
    
    summary.totalWaterGlasses = weekMetrics.reduce((sum, m) => 
      sum + m.water.glasses, 0);

    // Calculate goals met
    summary.daysWithGoalsMet = weekMetrics.filter(m => 
      m.steps.count >= m.steps.target && 
      m.water.glasses >= m.water.target &&
      m.dataCompleteness >= 70
    ).length;

    // Weight change
    const weightsWithWeight = weekMetrics.filter(m => m.weight);
    if (weightsWithWeight.length >= 2) {
      const firstWeight = weightsWithWeight[0].weight!;
      const lastWeight = weightsWithWeight[weightsWithWeight.length - 1].weight!;
      summary.weightChange = lastWeight - firstWeight;
    }

    // Improvement areas
    if (summary.averageSleep < 7) summary.improvementAreas.push('Uyqu vaqtini oshiring');
    if (summary.averageSteps < 8000) summary.improvementAreas.push('Ko\'proq yuring');
    if (summary.totalWaterGlasses < 56) summary.improvementAreas.push('Ko\'proq suv iching'); // 8 glasses * 7 days

    // Achievements
    if (summary.daysWithGoalsMet >= 5) summary.achievements.push('Haftalik maqsadga erishish');
    if (summary.averageSleep >= 8) summary.achievements.push('Yaxshi uyqu rejimi');
    if (summary.averageSteps >= 10000) summary.achievements.push('Faol hayot tarzi');

    return summary;
  }

  private getWeekStartDate(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  private getWeekEndDate(startDate: string): string {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toISOString().split('T')[0];
  }

  // === TRACKING STREAKS === //

  private async updateTrackingStreak(telegramId: string): Promise<void> {
    try {
      const streakData = await this.telegramService.cloudStorage.getItem('tracking_streak');
      const streak = streakData ? JSON.parse(streakData) : { 
        currentDays: 0, 
        longestDays: 0, 
        lastTrackingDate: '' 
      };

      const today = new Date().toISOString().split('T')[0];
      const lastTrackingDate = new Date(streak.lastTrackingDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastTrackingDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.currentDays += 1;
      } else if (diffDays > 1) {
        streak.currentDays = 1;
      }

      if (streak.currentDays > streak.longestDays) {
        streak.longestDays = streak.currentDays;
      }

      streak.lastTrackingDate = today;

      await this.telegramService.cloudStorage.setItem(
        'tracking_streak', 
        JSON.stringify(streak)
      );
    } catch (error) {
      console.error('Error updating tracking streak:', error);
    }
  }

  // === REMINDERS MANAGEMENT === //

  async getReminders(telegramId: string): Promise<TrackingReminder[]> {
    try {
      const data = await this.telegramService.cloudStorage.getItem('tracking_reminders');
      return data ? JSON.parse(data) : DEFAULT_REMINDERS;
    } catch (error) {
      console.error('Error getting reminders:', error);
      return DEFAULT_REMINDERS;
    }
  }

  async saveReminders(telegramId: string, reminders: TrackingReminder[]): Promise<boolean> {
    try {
      return await this.telegramService.cloudStorage.setItem(
        'tracking_reminders', 
        JSON.stringify(reminders)
      );
    } catch (error) {
      console.error('Error saving reminders:', error);
      return false;
    }
  }

  async addCustomReminder(
    telegramId: string, 
    reminder: Omit<TrackingReminder, 'id'>
  ): Promise<string> {
    try {
      const reminders = await this.getReminders(telegramId);
      const newReminder: TrackingReminder = {
        ...reminder,
        id: `custom_${Date.now()}`
      };
      
      reminders.push(newReminder);
      await this.saveReminders(telegramId, reminders);
      
      return newReminder.id;
    } catch (error) {
      console.error('Error adding custom reminder:', error);
      throw error;
    }
  }

  // === DATA EXPORT === //

  async exportTrackingData(telegramId: string, days: number = 30): Promise<string | null> {
    try {
      const metrics: DailyMetrics[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMetrics = await this.getMetricsForDate(telegramId, dateStr);
        if (dayMetrics) metrics.push(dayMetrics);
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        telegramId,
        period: `${days} days`,
        totalDays: metrics.length,
        metrics,
        summary: metrics.length > 0 ? this.calculatePeriodSummary(metrics) : null
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting tracking data:', error);
      return null;
    }
  }

  private calculatePeriodSummary(metrics: DailyMetrics[]): any {
    // Calculate overall statistics for the period
    return {
      averageCompleteness: metrics.reduce((sum, m) => sum + m.dataCompleteness, 0) / metrics.length,
      totalDaysTracked: metrics.length,
      bestDay: metrics.reduce((best, current) => 
        current.dataCompleteness > best.dataCompleteness ? current : best
      ),
      // Add more summary statistics as needed
    };
  }
}

// === DEFAULT REMINDERS === //

export const DEFAULT_REMINDERS: TrackingReminder[] = [
  {
    id: 'morning_weight',
    type: 'weight',
    title: 'Ertalabki vazn',
    message: '🌅 Yaxshi tongingiz! Vaznni o\'lchashni unutmang.',
    time: '07:00',
    frequency: 'daily',
    enabled: true
  },
  {
    id: 'evening_reflection',
    type: 'mood',
    title: 'Kechki mulohaza',
    message: '🌙 Bugungi kayfiyat va energiyangizni baholang.',
    time: '21:00',
    frequency: 'daily',
    enabled: true
  },
  {
    id: 'water_reminder',
    type: 'water',
    title: 'Suv eslatmasi',
    message: '💧 Suv ichishni unutmang! Sog\'lik uchun muhim.',
    time: '10:00',
    frequency: 'daily',
    enabled: true
  },
  {
    id: 'bedtime_reminder',
    type: 'sleep',
    title: 'Uyqu vaqti',
    message: '😴 Ertaga sog\'lom bo\'lish uchun vaqtida uxlang.',
    time: '22:30',
    frequency: 'daily',
    enabled: true
  },
  {
    id: 'weekly_review',
    type: 'custom',
    title: 'Haftalik tahlil',
    message: '📊 Haftalik taraqqiyotingizni ko\'rib chiqing.',
    time: '10:00',
    frequency: 'weekly',
    days: ['sunday'],
    enabled: true
  }
];

export default DailyTrackingService;