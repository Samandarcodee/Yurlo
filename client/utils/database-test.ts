import { supabase, databaseService } from '../lib/supabase';

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing database connection...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Test user profile operations
export const testUserProfileOperations = async (telegramId: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing user profile operations...');
    
    // Test create profile
    const testProfile = {
      telegram_id: telegramId,
      name: 'Test User',
      gender: 'male',
      birth_year: '1990',
      age: 30,
      height: '175',
      weight: '70',
      activity_level: 'moderate',
      goal: 'maintain_weight',
      language: 'uz',
      bmr: 1800,
      daily_calories: 2200,
      is_first_time: false,
    };
    
    const created = await databaseService.createUserProfile(testProfile);
    if (!created) {
      console.error('❌ Failed to create user profile');
      return false;
    }
    
    // Test get profile
    const retrieved = await databaseService.getUserProfile(telegramId);
    if (!retrieved) {
      console.error('❌ Failed to retrieve user profile');
      return false;
    }
    
    // Test update profile
    const updated = await databaseService.updateUserProfile(telegramId, {
      name: 'Updated Test User'
    });
    if (!updated) {
      console.error('❌ Failed to update user profile');
      return false;
    }
    
    console.log('✅ User profile operations successful');
    return true;
  } catch (error) {
    console.error('❌ User profile operations failed:', error);
    return false;
  }
};

// Test sleep session operations
export const testSleepSessionOperations = async (telegramId: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing sleep session operations...');
    
    // Get user profile first
    const userProfile = await databaseService.getUserProfile(telegramId);
    if (!userProfile) {
      console.error('❌ User profile not found for sleep session test');
      return false;
    }
    
    const testSession = {
      user_id: userProfile.id!,
      date: new Date().toISOString().split('T')[0],
      bed_time: '23:00',
      wake_time: '07:00',
      duration: 8.0,
      quality: 8,
      notes: 'Test sleep session'
    };
    
    const created = await databaseService.createSleepSession(testSession);
    if (!created) {
      console.error('❌ Failed to create sleep session');
      return false;
    }
    
    const sessions = await databaseService.getSleepSessions(userProfile.id!);
    if (sessions.length === 0) {
      console.error('❌ Failed to retrieve sleep sessions');
      return false;
    }
    
    console.log('✅ Sleep session operations successful');
    return true;
  } catch (error) {
    console.error('❌ Sleep session operations failed:', error);
    return false;
  }
};

// Test step session operations
export const testStepSessionOperations = async (telegramId: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing step session operations...');
    
    // Get user profile first
    const userProfile = await databaseService.getUserProfile(telegramId);
    if (!userProfile) {
      console.error('❌ User profile not found for step session test');
      return false;
    }
    
    const testSession = {
      user_id: userProfile.id!,
      date: new Date().toISOString().split('T')[0],
      steps: 10000,
      distance: 8.0,
      calories: 400,
      duration: 120,
      avg_pace: 83.33
    };
    
    const created = await databaseService.createStepSession(testSession);
    if (!created) {
      console.error('❌ Failed to create step session');
      return false;
    }
    
    const sessions = await databaseService.getStepSessions(userProfile.id!);
    if (sessions.length === 0) {
      console.error('❌ Failed to retrieve step sessions');
      return false;
    }
    
    console.log('✅ Step session operations successful');
    return true;
  } catch (error) {
    console.error('❌ Step session operations failed:', error);
    return false;
  }
};

// Test meal entry operations
export const testMealEntryOperations = async (telegramId: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing meal entry operations...');
    
    // Get user profile first
    const userProfile = await databaseService.getUserProfile(telegramId);
    if (!userProfile) {
      console.error('❌ User profile not found for meal entry test');
      return false;
    }
    
    const testMeal = {
      user_id: userProfile.id!,
      name: 'Test Meal',
      calories: 500,
      protein: 25.0,
      carbs: 60.0,
      fat: 15.0,
      meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      date: new Date().toISOString().split('T')[0]
    };
    
    const created = await databaseService.createMealEntry(testMeal);
    if (!created) {
      console.error('❌ Failed to create meal entry');
      return false;
    }
    
    const meals = await databaseService.getMealEntries(userProfile.id!);
    if (meals.length === 0) {
      console.error('❌ Failed to retrieve meal entries');
      return false;
    }
    
    // Test delete meal entry
    const deleted = await databaseService.deleteMealEntry(created.id!);
    if (!deleted) {
      console.error('❌ Failed to delete meal entry');
      return false;
    }
    
    console.log('✅ Meal entry operations successful');
    return true;
  } catch (error) {
    console.error('❌ Meal entry operations failed:', error);
    return false;
  }
};

// Test data migration from localStorage
export const testDataMigration = async (telegramId: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing data migration from localStorage...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('ℹ️ Not in browser environment, skipping localStorage test');
      return true;
    }
    
    const storageKey = `userProfile_${telegramId}`;
    const savedProfile = localStorage.getItem(storageKey);
    
    if (!savedProfile) {
      console.log('ℹ️ No localStorage data to migrate');
      return true;
    }
    
    const profileData = JSON.parse(savedProfile);
    
    // Check if profile already exists in database
    const existingProfile = await databaseService.getUserProfile(telegramId);
    if (existingProfile) {
      console.log('ℹ️ Profile already exists in database, skipping migration');
      return true;
    }
    
    // Migrate profile data
    const dbProfile = {
      telegram_id: telegramId,
      name: profileData.name,
      gender: profileData.gender,
      birth_year: profileData.birthYear,
      age: profileData.age,
      height: profileData.height,
      weight: profileData.weight,
      activity_level: profileData.activityLevel,
      goal: profileData.goal,
      sleep_time: profileData.sleepTime,
      wake_time: profileData.wakeTime,
      language: profileData.language,
      bmr: profileData.bmr,
      daily_calories: profileData.dailyCalories,
      is_first_time: profileData.isFirstTime,
    };
    
    const migrated = await databaseService.createUserProfile(dbProfile);
    if (migrated) {
      // Remove from localStorage after successful migration
      localStorage.removeItem(storageKey);
      console.log('✅ Data migrated successfully from localStorage');
      return true;
    } else {
      console.error('❌ Failed to migrate data from localStorage');
      return false;
    }
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    return false;
  }
};

// Comprehensive database test
export const runComprehensiveDatabaseTest = async (telegramId: string): Promise<{
  connection: boolean;
  userProfile: boolean;
  sleepSessions: boolean;
  stepSessions: boolean;
  mealEntries: boolean;
  migration: boolean;
}> => {
  console.log('🚀 Starting comprehensive database test...');
  
  const results = {
    connection: await testDatabaseConnection(),
    userProfile: false,
    sleepSessions: false,
    stepSessions: false,
    mealEntries: false,
    migration: await testDataMigration(telegramId),
  };
  
  if (results.connection) {
    results.userProfile = await testUserProfileOperations(telegramId);
    results.sleepSessions = await testSleepSessionOperations(telegramId);
    results.stepSessions = await testStepSessionOperations(telegramId);
    results.mealEntries = await testMealEntryOperations(telegramId);
  }
  
  console.log('📊 Database test results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(allPassed ? '✅ All database tests passed!' : '❌ Some database tests failed');
  
  return results;
}; 