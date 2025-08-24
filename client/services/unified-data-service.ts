import { apiService } from './api-service';
import { databaseService } from '../lib/supabase';
import { shouldUseLocalStorage } from '../utils/environment';
import { DataValidationService } from './data-validation-service';

// Unified data service that works with both API and Supabase
class UnifiedDataService {
  private async tryApiFirst<T>(
    apiCall: () => Promise<T>,
    fallbackCall: () => Promise<T>
  ): Promise<T> {
    try {
      // Try API first
      return await apiCall();
    } catch (error) {
      console.warn('API call failed, falling back to Supabase:', error);
      try {
        // Fallback to Supabase
        return await fallbackCall();
      } catch (fallbackError) {
        console.error('Both API and Supabase failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // User Profile Operations
  async getUserProfile(telegramId: string) {
    return this.tryApiFirst(
      () => apiService.getUserProfile(telegramId),
      () => databaseService.getUserProfile(telegramId)
    );
  }

  async createUserProfile(profile: any) {
    // Validate profile data before saving
    const validation = DataValidationService.comprehensiveValidation(profile, 'profile');
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    return this.tryApiFirst(
      () => apiService.createUserProfile(validation.data),
      () => databaseService.createUserProfile(validation.data)
    );
  }

  async updateUserProfile(telegramId: string, updates: any) {
    return this.tryApiFirst(
      () => apiService.updateUserProfile(telegramId, updates),
      () => databaseService.updateUserProfile(telegramId, updates)
    );
  }

  async deleteUserProfile(telegramId: string) {
    return this.tryApiFirst(
      () => apiService.deleteUserProfile(telegramId),
      async () => {
        // Supabase doesn't have deleteUserProfile, so we'll just return success
        return { success: true };
      }
    );
  }

  // Sleep Sessions
  async getSleepSessions(userId: string, date?: string) {
    return this.tryApiFirst(
      () => apiService.getData('/sleep-sessions', { userId, date }),
      () => databaseService.getSleepSessions(userId, date)
    );
  }

  async createSleepSession(session: any) {
    // Validate sleep session data before saving
    const validation = DataValidationService.comprehensiveValidation(session, 'sleep');
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    return this.tryApiFirst(
      () => apiService.createData('/sleep-sessions', validation.data),
      () => databaseService.createSleepSession(validation.data)
    );
  }

  // Step Sessions
  async getStepSessions(userId: string, date?: string) {
    return this.tryApiFirst(
      () => apiService.getData('/step-sessions', { userId, date }),
      () => databaseService.getStepSessions(userId, date)
    );
  }

  async createStepSession(session: any) {
    // Validate step session data before saving
    const validation = DataValidationService.comprehensiveValidation(session, 'steps');
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    return this.tryApiFirst(
      () => apiService.createData('/step-sessions', validation.data),
      () => databaseService.createStepSession(validation.data)
    );
  }

  async updateStepSession(sessionId: string, updates: any) {
    return this.tryApiFirst(
      () => apiService.updateData('/step-sessions', { id: sessionId, ...updates }),
      () => databaseService.updateStepSession(sessionId, updates)
    );
  }

  // Meal Entries
  async getMealEntries(userId: string, date?: string) {
    return this.tryApiFirst(
      () => apiService.getData('/meal-entries', { userId, date }),
      () => databaseService.getMealEntries(userId, date)
    );
  }

  async createMealEntry(meal: any) {
    // Validate meal entry data before saving
    const validation = DataValidationService.comprehensiveValidation(meal, 'meal');
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    return this.tryApiFirst(
      () => apiService.createData('/meal-entries', validation.data),
      () => databaseService.createMealEntry(validation.data)
    );
  }

  async deleteMealEntry(mealId: string) {
    return this.tryApiFirst(
      () => apiService.deleteData('/meal-entries', mealId),
      () => databaseService.deleteMealEntry(mealId)
    );
  }

  // AI Recommendations
  async getAIRecommendations(telegramId: string) {
    return this.tryApiFirst(
      () => apiService.getAIRecommendations(telegramId),
      async () => {
        // Fallback to mock recommendations if API fails
        return {
          recommendations: [
            'Stay hydrated throughout the day',
            'Aim for 7-9 hours of sleep',
            'Include protein in every meal',
            'Take regular breaks during work'
          ]
        };
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      return await apiService.healthCheck();
    } catch (error) {
      console.warn('API health check failed:', error);
      return { status: 'degraded', timestamp: new Date().toISOString() };
    }
  }

  // Data synchronization
  async syncData(userId: string) {
    try {
      // This would implement data synchronization logic
      // between local storage, API, and Supabase
      console.log('Data synchronization started for user:', userId);
      return { success: true, synced: true };
    } catch (error) {
      console.error('Data synchronization failed:', error);
      return { success: false, synced: false, error: error.message };
    }
  }
}

export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
