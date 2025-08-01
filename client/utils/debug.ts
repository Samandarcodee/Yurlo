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
  },

  // Check app state
  checkAppState: () => {
    console.log('=== APP STATE DEBUG ===');
    console.log('Window Telegram:', typeof window !== 'undefined' ? !!window.Telegram : 'No window');
    console.log('Telegram WebApp:', typeof window !== 'undefined' && window.Telegram ? !!window.Telegram.WebApp : 'No WebApp');
    console.log('localStorage available:', typeof localStorage !== 'undefined');
    console.log('User profiles in localStorage:', DebugUtils.showAllUserData());
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('=== END DEBUG ===');
  },

  // Force reload with cache clear
  forceReload: () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log('Cache cleared:', name);
        });
      });
    }
    window.location.reload();
  },

  // Test Telegram WebApp
  testTelegramWebApp: () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      console.log('Telegram WebApp found:', {
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe
      });
      return true;
    } else {
      console.log('Telegram WebApp not found');
      return false;
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).DebugUtils = DebugUtils;
}