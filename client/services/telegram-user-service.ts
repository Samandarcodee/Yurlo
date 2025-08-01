/**
 * Professional Telegram User Service
 * Handles user data management and cloud storage
 */

import { TelegramUser } from '../types/telegram';

export interface UserProfile {
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  // Health data
  age?: number;
  gender?: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: {
    type: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle';
    targetWeight?: number;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
  };
  preferences?: {
    units: 'metric' | 'imperial';
    language: 'uz' | 'ru' | 'en';
    notifications: boolean;
    darkMode?: boolean;
  };
  // Tracking data
  createdAt: string;
  lastActiveAt: string;
  completedOnboarding: boolean;
}

export interface DailyTrackingData {
  date: string;
  calories: {
    consumed: number;
    burned: number;
    target: number;
  };
  macros: {
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
    fiber: { consumed: number; target: number };
  };
  water: {
    consumed: number; // glasses
    target: number;
  };
  steps: {
    count: number;
    target: number;
  };
  sleep: {
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    bedtime?: string;
    wakeTime?: string;
  };
  weight?: number;
  mood?: 'terrible' | 'bad' | 'okay' | 'good' | 'excellent';
  notes?: string;
}

export interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timestamp: string;
  portion?: number;
  notes?: string;
}

class TelegramUserService {
  private static instance: TelegramUserService;
  private cloudStorage: any;

  constructor(cloudStorage: any) {
    this.cloudStorage = cloudStorage;
  }

  static getInstance(cloudStorage: any): TelegramUserService {
    if (!TelegramUserService.instance) {
      TelegramUserService.instance = new TelegramUserService(cloudStorage);
    }
    return TelegramUserService.instance;
  }

  // === USER PROFILE MANAGEMENT === //

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const profileData = JSON.stringify(profile);
      return await this.cloudStorage.setItem('user_profile', profileData);
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  async getUserProfile(telegramId: string): Promise<UserProfile | null> {
    try {
      const profileData = await this.cloudStorage.getItem('user_profile');
      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        // Update last active time
        profile.lastActiveAt = new Date().toISOString();
        await this.saveUserProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async createInitialProfile(telegramUser: TelegramUser): Promise<UserProfile> {
    const initialProfile: UserProfile = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      languageCode: telegramUser.language_code,
      isPremium: telegramUser.is_premium,
      photoUrl: telegramUser.photo_url,
      preferences: {
        units: 'metric',
        language: (telegramUser.language_code as 'uz' | 'ru' | 'en') || 'uz',
        notifications: true,
        darkMode: false,
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedOnboarding: false,
    };

    await this.saveUserProfile(initialProfile);
    return initialProfile;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const currentProfile = await this.cloudStorage.getItem('user_profile');
      if (currentProfile) {
        const profile: UserProfile = JSON.parse(currentProfile);
        const updatedProfile = { ...profile, ...updates, lastActiveAt: new Date().toISOString() };
        return await this.saveUserProfile(updatedProfile);
      }
      return false;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // === DAILY TRACKING === //

  async saveDailyTracking(date: string, data: DailyTrackingData): Promise<boolean> {
    try {
      const key = `daily_tracking_${date}`;
      const trackingData = JSON.stringify(data);
      return await this.cloudStorage.setItem(key, trackingData);
    } catch (error) {
      console.error('Error saving daily tracking:', error);
      return false;
    }
  }

  async getDailyTracking(date: string): Promise<DailyTrackingData | null> {
    try {
      const key = `daily_tracking_${date}`;
      const trackingData = await this.cloudStorage.getItem(key);
      if (trackingData) {
        return JSON.parse(trackingData);
      }
      return null;
    } catch (error) {
      console.error('Error getting daily tracking:', error);
      return null;
    }
  }

  async getTrackingHistory(days: number = 30): Promise<DailyTrackingData[]> {
    try {
      const dates: string[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      const keys = dates.map(date => `daily_tracking_${date}`);
      const trackingData = await this.cloudStorage.getItems(keys);
      
      const history: DailyTrackingData[] = [];
      dates.forEach(date => {
        const key = `daily_tracking_${date}`;
        if (trackingData[key]) {
          try {
            history.push(JSON.parse(trackingData[key]));
          } catch (e) {
            console.error('Error parsing tracking data for date:', date);
          }
        }
      });

      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting tracking history:', error);
      return [];
    }
  }

  // === MEAL MANAGEMENT === //

  async saveMeal(meal: MealEntry): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealsKey = `meals_${today}`;
      
      // Get existing meals for today
      const existingMeals = await this.cloudStorage.getItem(mealsKey);
      let meals: MealEntry[] = [];
      
      if (existingMeals) {
        meals = JSON.parse(existingMeals);
      }
      
      // Add new meal
      meals.push(meal);
      
      // Save updated meals
      const mealsData = JSON.stringify(meals);
      return await this.cloudStorage.setItem(mealsKey, mealsData);
    } catch (error) {
      console.error('Error saving meal:', error);
      return false;
    }
  }

  async getMealsForDate(date: string): Promise<MealEntry[]> {
    try {
      const mealsKey = `meals_${date}`;
      const mealsData = await this.cloudStorage.getItem(mealsKey);
      
      if (mealsData) {
        return JSON.parse(mealsData);
      }
      return [];
    } catch (error) {
      console.error('Error getting meals for date:', error);
      return [];
    }
  }

  async deleteMeal(date: string, mealId: string): Promise<boolean> {
    try {
      const mealsKey = `meals_${date}`;
      const mealsData = await this.cloudStorage.getItem(mealsKey);
      
      if (mealsData) {
        let meals: MealEntry[] = JSON.parse(mealsData);
        meals = meals.filter(meal => meal.id !== mealId);
        
        const updatedMealsData = JSON.stringify(meals);
        return await this.cloudStorage.setItem(mealsKey, updatedMealsData);
      }
      return false;
    } catch (error) {
      console.error('Error deleting meal:', error);
      return false;
    }
  }

  // === UTILITIES === //

  async clearAllData(): Promise<boolean> {
    try {
      const keys = await this.cloudStorage.getKeys();
      const userKeys = keys.filter((key: string) => 
        key.startsWith('user_profile') || 
        key.startsWith('daily_tracking_') || 
        key.startsWith('meals_')
      );
      
      return await this.cloudStorage.removeItems(userKeys);
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  async exportUserData(): Promise<string | null> {
    try {
      const keys = await this.cloudStorage.getKeys();
      const userData = await this.cloudStorage.getItems(keys);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: userData,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  // === BMR CALCULATION === //

  calculateBMR(profile: UserProfile): number {
    if (!profile.age || !profile.height || !profile.weight || !profile.gender) {
      return 0;
    }

    let bmr: number;
    
    if (profile.gender === 'male') {
      // Mifflin-St Jeor Equation for men
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      // Mifflin-St Jeor Equation for women
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    return Math.round(bmr);
  }

  // === TDEE CALCULATION === //

  calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    
    const activityMultipliers = {
      sedentary: 1.2,      // Little to no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
      very_active: 1.9,    // Very heavy exercise, physical job
    };

    const multiplier = activityMultipliers[profile.activityLevel || 'sedentary'];
    return Math.round(bmr * multiplier);
  }

  // === GOAL CALCULATIONS === //

  calculateGoalCalories(profile: UserProfile): number {
    const tdee = this.calculateTDEE(profile);
    
    if (!profile.goals?.type) {
      return tdee;
    }

    switch (profile.goals.type) {
      case 'lose_weight':
        return Math.round(tdee * 0.8); // 20% deficit
      case 'gain_weight':
        return Math.round(tdee * 1.15); // 15% surplus
      case 'build_muscle':
        return Math.round(tdee * 1.1); // 10% surplus
      case 'maintain_weight':
      default:
        return tdee;
    }
  }

  calculateMacroTargets(profile: UserProfile): { protein: number; carbs: number; fat: number } {
    const goalCalories = this.calculateGoalCalories(profile);
    
    // Default macro ratios (can be customized)
    const proteinPercentage = 0.25; // 25%
    const fatPercentage = 0.25;     // 25%
    const carbsPercentage = 0.50;   // 50%

    return {
      protein: Math.round((goalCalories * proteinPercentage) / 4), // 4 calories per gram
      carbs: Math.round((goalCalories * carbsPercentage) / 4),     // 4 calories per gram
      fat: Math.round((goalCalories * fatPercentage) / 9),         // 9 calories per gram
    };
  }
}

export default TelegramUserService;