/**
 * Enhanced storage utilities for reliable data persistence
 */

export const Storage = {
  // Clear all user data
  clearUserData: (telegramId: string) => {
    const storageKey = `userProfile_${telegramId}`;
    try {
      localStorage.removeItem(storageKey);
      console.log("User data cleared from localStorage");
      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
  },

  // Get user data
  getUserData: (telegramId: string) => {
    const storageKey = `userProfile_${telegramId}`;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        console.log("Retrieved user data:", parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Save user data
  saveUserData: (telegramId: string, userData: any) => {
    const storageKey = `userProfile_${telegramId}`;
    try {
      userData.isFirstTime = false;
      userData.updatedAt = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(userData));
      console.log("User data saved successfully:", userData);
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  },

  // Check if user exists
  userExists: (telegramId: string): boolean => {
    const userData = Storage.getUserData(telegramId);
    return userData !== null && userData.name && userData.age;
  }
};

// Clear all stored data
export const clearAllStoredData = (): void => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear specific keys if they exist
    const keysToRemove = [
      'userProfile',
      'calorieData',
      'mealEntries',
      'sleepSessions',
      'stepSessions',
      'waterIntake',
      'workoutSessions',
      'yurlo_user_data',
      'yurlo_calories',
      'yurlo_meals',
      'yurlo_sleep',
      'yurlo_steps'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ All stored data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing stored data:', error);
  }
};

// Reset user data to initial state
export const resetUserData = (): void => {
  try {
    clearAllStoredData();
    
    // Reset to default values
    const defaultData = {
      calories: 0,
      goal: 2200,
      meals: [],
      sleep: [],
      steps: [],
      water: []
    };
    
    // Set default values
    Object.entries(defaultData).forEach(([key, value]) => {
      localStorage.setItem(`yurlo_${key}`, JSON.stringify(value));
    });
    
    console.log('✅ User data reset to defaults');
  } catch (error) {
    console.error('❌ Error resetting user data:', error);
  }
};