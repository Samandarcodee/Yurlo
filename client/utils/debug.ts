/**
 * Debug utilities for development - localStorage operations
 * Usage in browser console: (window as any).DebugUtils.clearAllUserData()
 */

export const DebugUtils = {
  // Clear ALL user data from localStorage
  clearAllUserData: () => {
    const keys = Object.keys(localStorage);
    const userProfileKeys = keys.filter(key => key.startsWith('userProfile_'));
    
    userProfileKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });
    
    console.log(`Cleared ${userProfileKeys.length} user profile(s)`);
    window.location.reload();
  },

  // Show all user data in localStorage
  showAllUserData: () => {
    const keys = Object.keys(localStorage);
    const userProfileKeys = keys.filter(key => key.startsWith('userProfile_'));
    
    userProfileKeys.forEach(key => {
      const data = localStorage.getItem(key);
      console.log(`${key}:`, JSON.parse(data || '{}'));
    });
    
    return userProfileKeys.length;
  },

  // Force show onboarding
  forceOnboarding: () => {
    DebugUtils.clearAllUserData();
  },

  // Set user as completed
  markUserCompleted: (telegramId = 'demo_user_123') => {
    const storageKey = `userProfile_${telegramId}`;
    const mockUserData = {
      telegramId: telegramId,
      name: 'Test User',
      gender: 'male',
      birthYear: '1990',
      age: 34,
      height: '175',
      weight: '70',
      activityLevel: 'medium',
      goal: 'maintain',
      language: 'uz',
      bmr: 1800,
      dailyCalories: 2200,
      isFirstTime: false,
      completedOnboarding: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(mockUserData));
    console.log('Mock user data saved:', mockUserData);
    window.location.reload();
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).DebugUtils = DebugUtils;
}