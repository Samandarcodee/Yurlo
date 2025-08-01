/**
 * Enhanced User Profile Service
 * Comprehensive user profile management with Telegram integration
 */

import TelegramUserService, { UserProfile as TelegramUserProfile } from './telegram-user-service';

export interface EnhancedUserProfile extends TelegramUserProfile {
  // Extended profile data
  avatar?: string;
  bio?: string;
  timezone?: string;
  
  // Health metrics
  bodyFatPercentage?: number;
  muscleMass?: number;
  boneWeight?: number;
  visceralFat?: number;
  metabolicAge?: number;
  
  // Advanced goals
  weeklyWeightChangeGoal?: number; // kg per week
  bodyFatGoal?: number;
  muscleMassGoal?: number;
  
  // Dietary preferences
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteFoods?: string[];
  dislikedFoods?: string[];
  
  // Activity preferences
  preferredExerciseTypes?: string[];
  gymMembership?: boolean;
  homeWorkout?: boolean;
  
  // Schedule preferences
  mealTimes?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string[];
  };
  workoutTimes?: string[];
  
  // Notification preferences
  reminderSettings?: {
    mealReminders: boolean;
    waterReminders: boolean;
    exerciseReminders: boolean;
    sleepReminders: boolean;
    medicationReminders?: boolean;
    customReminders?: Array<{
      id: string;
      title: string;
      time: string;
      days: string[];
      enabled: boolean;
    }>;
  };
  
  // Privacy settings
  privacySettings?: {
    shareProgressWithFriends: boolean;
    allowDataAnalytics: boolean;
    showInLeaderboards: boolean;
  };
  
  // Achievement data
  achievements?: Achievement[];
  badges?: Badge[];
  level?: number;
  experience?: number;
  streak?: {
    currentDays: number;
    longestDays: number;
    lastActiveDate: string;
  };
  
  // Social features
  friends?: string[];
  followers?: string[];
  following?: string[];
  
  // Progress tracking
  progressPhotos?: ProgressPhoto[];
  measurements?: BodyMeasurement[];
  
  // Medical information (optional)
  medicalConditions?: string[];
  medications?: string[];
  doctorRecommendations?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'nutrition' | 'exercise' | 'consistency' | 'weight' | 'social';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string;
  criteria: string;
}

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  weight?: number;
  notes?: string;
  type: 'front' | 'side' | 'back';
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  neck?: number;
  notes?: string;
}

// === PROFILE MANAGEMENT SERVICE === //

class UserProfileService {
  private static instance: UserProfileService;
  private telegramService: TelegramUserService;

  constructor(telegramService: TelegramUserService) {
    this.telegramService = telegramService;
  }

  static getInstance(telegramService: TelegramUserService): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService(telegramService);
    }
    return UserProfileService.instance;
  }

  // === PROFILE MANAGEMENT === //

  async getEnhancedProfile(telegramId: string): Promise<EnhancedUserProfile | null> {
    try {
      const baseProfile = await this.telegramService.getUserProfile(telegramId);
      if (!baseProfile) return null;

      // Get extended profile data
      const extendedData = await this.telegramService.cloudStorage.getItem('extended_profile');
      const extended = extendedData ? JSON.parse(extendedData) : {};

      return { ...baseProfile, ...extended };
    } catch (error) {
      console.error('Error getting enhanced profile:', error);
      return null;
    }
  }

  async updateProfileSection(
    telegramId: string, 
    section: keyof EnhancedUserProfile, 
    data: any
  ): Promise<boolean> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return false;

      const updatedProfile = { ...profile, [section]: data };
      
      // Save base profile data to Telegram service
      const baseProfile: TelegramUserProfile = {
        telegramId: profile.telegramId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        languageCode: profile.languageCode,
        isPremium: profile.isPremium,
        photoUrl: profile.photoUrl,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
        goals: profile.goals,
        preferences: profile.preferences,
        createdAt: profile.createdAt,
        lastActiveAt: profile.lastActiveAt,
        completedOnboarding: profile.completedOnboarding
      };

      await this.telegramService.saveUserProfile(baseProfile);

      // Save extended data separately
      const extendedData = {
        avatar: updatedProfile.avatar,
        bio: updatedProfile.bio,
        timezone: updatedProfile.timezone,
        bodyFatPercentage: updatedProfile.bodyFatPercentage,
        muscleMass: updatedProfile.muscleMass,
        boneWeight: updatedProfile.boneWeight,
        visceralFat: updatedProfile.visceralFat,
        metabolicAge: updatedProfile.metabolicAge,
        weeklyWeightChangeGoal: updatedProfile.weeklyWeightChangeGoal,
        bodyFatGoal: updatedProfile.bodyFatGoal,
        muscleMassGoal: updatedProfile.muscleMassGoal,
        dietaryRestrictions: updatedProfile.dietaryRestrictions,
        allergies: updatedProfile.allergies,
        favoriteFoods: updatedProfile.favoriteFoods,
        dislikedFoods: updatedProfile.dislikedFoods,
        preferredExerciseTypes: updatedProfile.preferredExerciseTypes,
        gymMembership: updatedProfile.gymMembership,
        homeWorkout: updatedProfile.homeWorkout,
        mealTimes: updatedProfile.mealTimes,
        workoutTimes: updatedProfile.workoutTimes,
        reminderSettings: updatedProfile.reminderSettings,
        privacySettings: updatedProfile.privacySettings,
        achievements: updatedProfile.achievements,
        badges: updatedProfile.badges,
        level: updatedProfile.level,
        experience: updatedProfile.experience,
        streak: updatedProfile.streak,
        friends: updatedProfile.friends,
        followers: updatedProfile.followers,
        following: updatedProfile.following,
        progressPhotos: updatedProfile.progressPhotos,
        measurements: updatedProfile.measurements,
        medicalConditions: updatedProfile.medicalConditions,
        medications: updatedProfile.medications,
        doctorRecommendations: updatedProfile.doctorRecommendations
      };

      return await this.telegramService.cloudStorage.setItem(
        'extended_profile', 
        JSON.stringify(extendedData)
      );
    } catch (error) {
      console.error('Error updating profile section:', error);
      return false;
    }
  }

  // === ACHIEVEMENTS & GAMIFICATION === //

  async unlockAchievement(telegramId: string, achievementId: string): Promise<boolean> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return false;

      const achievement = AVAILABLE_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return false;

      const achievements = profile.achievements || [];
      if (achievements.some(a => a.id === achievementId)) return false; // Already unlocked

      const newAchievement: Achievement = {
        ...achievement,
        unlockedAt: new Date().toISOString()
      };

      achievements.push(newAchievement);
      
      return await this.updateProfileSection(telegramId, 'achievements', achievements);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  async addExperience(telegramId: string, points: number): Promise<void> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return;

      const currentExp = profile.experience || 0;
      const currentLevel = profile.level || 1;
      const newExp = currentExp + points;

      // Calculate new level (simple formula: level = floor(exp / 1000) + 1)
      const newLevel = Math.floor(newExp / 1000) + 1;

      await this.updateProfileSection(telegramId, 'experience', newExp);
      
      if (newLevel > currentLevel) {
        await this.updateProfileSection(telegramId, 'level', newLevel);
        // Trigger level up celebration
        this.triggerLevelUpEvent(telegramId, newLevel);
      }
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  }

  private async triggerLevelUpEvent(telegramId: string, newLevel: number): Promise<void> {
    // This could trigger notifications, unlock new features, etc.
    console.log(`User ${telegramId} reached level ${newLevel}!`);
  }

  // === PROGRESS TRACKING === //

  async addProgressPhoto(
    telegramId: string, 
    photo: Omit<ProgressPhoto, 'id'>
  ): Promise<string> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) throw new Error('Profile not found');

      const photos = profile.progressPhotos || [];
      const newPhoto: ProgressPhoto = {
        ...photo,
        id: `photo_${Date.now()}`
      };

      photos.push(newPhoto);
      
      await this.updateProfileSection(telegramId, 'progressPhotos', photos);
      return newPhoto.id;
    } catch (error) {
      console.error('Error adding progress photo:', error);
      throw error;
    }
  }

  async addBodyMeasurement(
    telegramId: string, 
    measurement: Omit<BodyMeasurement, 'id'>
  ): Promise<string> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) throw new Error('Profile not found');

      const measurements = profile.measurements || [];
      const newMeasurement: BodyMeasurement = {
        ...measurement,
        id: `measurement_${Date.now()}`
      };

      measurements.push(newMeasurement);
      
      await this.updateProfileSection(telegramId, 'measurements', measurements);
      return newMeasurement.id;
    } catch (error) {
      console.error('Error adding body measurement:', error);
      throw error;
    }
  }

  // === STREAKS & CONSISTENCY === //

  async updateStreak(telegramId: string): Promise<void> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const streak = profile.streak || { 
        currentDays: 0, 
        longestDays: 0, 
        lastActiveDate: '' 
      };

      const lastActive = new Date(streak.lastActiveDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continuing streak
        streak.currentDays += 1;
      } else if (diffDays > 1) {
        // Streak broken
        streak.currentDays = 1;
      }
      // If diffDays === 0, same day, no change

      if (streak.currentDays > streak.longestDays) {
        streak.longestDays = streak.currentDays;
      }

      streak.lastActiveDate = today;

      await this.updateProfileSection(telegramId, 'streak', streak);

      // Check for streak achievements
      if (streak.currentDays === 7) {
        await this.unlockAchievement(telegramId, 'week_streak');
      } else if (streak.currentDays === 30) {
        await this.unlockAchievement(telegramId, 'month_streak');
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // === SOCIAL FEATURES === //

  async addFriend(telegramId: string, friendId: string): Promise<boolean> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return false;

      const friends = profile.friends || [];
      if (!friends.includes(friendId)) {
        friends.push(friendId);
        return await this.updateProfileSection(telegramId, 'friends', friends);
      }
      return true;
    } catch (error) {
      console.error('Error adding friend:', error);
      return false;
    }
  }

  // === DATA EXPORT === //

  async exportProfileData(telegramId: string): Promise<string | null> {
    try {
      const profile = await this.getEnhancedProfile(telegramId);
      if (!profile) return null;

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        profile,
        // Add tracking data
        trackingHistory: await this.telegramService.getTrackingHistory(30),
        meals: await this.telegramService.getMealsForDate(new Date().toISOString().split('T')[0])
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting profile data:', error);
      return null;
    }
  }
}

// === AVAILABLE ACHIEVEMENTS === //

export const AVAILABLE_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_meal',
    title: 'Birinchi taom',
    description: 'Birinchi marta ovqat qo\'shdingiz',
    icon: '🍽️',
    category: 'nutrition'
  },
  {
    id: 'week_streak',
    title: 'Bir hafta',
    description: '7 kun ketma-ket faollik ko\'rsatdingiz',
    icon: '🔥',
    category: 'consistency'
  },
  {
    id: 'month_streak',
    title: 'Bir oy',
    description: '30 kun ketma-ket faollik ko\'rsatdingiz',
    icon: '💎',
    category: 'consistency'
  },
  {
    id: 'goal_weight',
    title: 'Maqsadga erishish',
    description: 'Vazn maqsadingizga erishdingiz',
    icon: '🎯',
    category: 'weight'
  },
  {
    id: 'water_master',
    title: 'Suv ustasi',
    description: '7 kun ketma-ket suv rejangizni bajardingiz',
    icon: '💧',
    category: 'nutrition'
  },
  {
    id: 'exercise_starter',
    title: 'Sport boshlovchi',
    description: 'Birinchi mashqni bajardingiz',
    icon: '🏃',
    category: 'exercise'
  }
];

export default UserProfileService;