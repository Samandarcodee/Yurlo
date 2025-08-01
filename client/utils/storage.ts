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