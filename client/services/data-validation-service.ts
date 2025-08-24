import { z } from 'zod';

// Validation schemas for different data types
export const userProfileSchema = z.object({
  telegramId: z.string().min(1, 'Telegram ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  birthYear: z.string().refine((val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  }, 'Birth year must be between 1900 and current year'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Age must be reasonable'),
  height: z.string().refine((val) => {
    const height = parseFloat(val);
    return height >= 100 && height <= 250;
  }, 'Height must be between 100 and 250 cm'),
  weight: z.string().refine((val) => {
    const weight = parseFloat(val);
    return weight >= 30 && weight <= 300;
  }, 'Weight must be between 30 and 300 kg'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], {
    required_error: 'Activity level is required'
  }),
  goal: z.enum(['lose', 'maintain', 'gain'], { required_error: 'Goal is required' }),
  sleepTime: z.string().optional(),
  wakeTime: z.string().optional(),
  language: z.enum(['en', 'uz', 'ru']).default('en'),
  bmr: z.number().min(800, 'BMR must be at least 800').max(5000, 'BMR must be reasonable'),
  dailyCalories: z.number().min(1000, 'Daily calories must be at least 1000').max(8000, 'Daily calories must be reasonable'),
  isFirstTime: z.boolean().default(true)
});

export const sleepSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid date is required'),
  bedTime: z.string().min(1, 'Bed time is required'),
  wakeTime: z.string().min(1, 'Wake time is required'),
  duration: z.number().min(0, 'Duration cannot be negative').max(24, 'Duration cannot exceed 24 hours'),
  quality: z.number().min(1, 'Quality must be at least 1').max(10, 'Quality cannot exceed 10'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

export const stepSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid date is required'),
  steps: z.number().min(0, 'Steps cannot be negative').max(100000, 'Steps must be reasonable'),
  distance: z.number().min(0, 'Distance cannot be negative').max(100, 'Distance must be reasonable (km)'),
  calories: z.number().min(0, 'Calories cannot be negative').max(5000, 'Calories must be reasonable'),
  duration: z.number().min(0, 'Duration cannot be negative').max(24, 'Duration cannot exceed 24 hours'),
  avgPace: z.number().min(0).max(20).optional() // km/h
});

export const mealEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Meal name is required').max(100, 'Meal name must be less than 100 characters'),
  calories: z.number().min(0, 'Calories cannot be negative').max(5000, 'Calories must be reasonable'),
  protein: z.number().min(0, 'Protein cannot be negative').max(500, 'Protein must be reasonable (g)'),
  carbs: z.number().min(0, 'Carbs cannot be negative').max(1000, 'Carbs must be reasonable (g)'),
  fat: z.number().min(0, 'Fat cannot be negative').max(200, 'Fat must be reasonable (g)'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], { required_error: 'Meal type is required' }),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid date is required')
});

export const waterIntakeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid date is required'),
  amount: z.number().min(0, 'Amount cannot be negative').max(10, 'Amount must be reasonable (liters)'),
  time: z.string().min(1, 'Time is required')
});

export const workoutSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid date is required'),
  type: z.enum(['cardio', 'strength', 'flexibility', 'sports', 'other'], { required_error: 'Workout type is required' }),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(300, 'Duration must be reasonable (minutes)'),
  calories: z.number().min(0, 'Calories cannot be negative').max(2000, 'Calories must be reasonable'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

// Validation service class
export class DataValidationService {
  // Validate user profile data
  static validateUserProfile(data: any) {
    try {
      const validated = userProfileSchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Validate sleep session data
  static validateSleepSession(data: any) {
    try {
      const validated = sleepSessionSchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Validate step session data
  static validateStepSession(data: any) {
    try {
      const validated = stepSessionSchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Validate meal entry data
  static validateMealEntry(data: any) {
    try {
      const validated = mealEntrySchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Validate water intake data
  static validateWaterIntake(data: any) {
    try {
      const validated = waterIntakeSchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Validate workout session data
  static validateWorkoutSession(data: any) {
    try {
      const validated = workoutSessionSchema.parse(data);
      return { success: true, data: validated, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
  }

  // Sanitize user input (remove potentially harmful characters)
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  // Validate and sanitize all user inputs
  static validateAndSanitizeUserProfile(data: any) {
    // Sanitize string inputs
    const sanitized = {
      ...data,
      name: this.sanitizeInput(data.name || ''),
      notes: data.notes ? this.sanitizeInput(data.notes) : ''
    };

    return this.validateUserProfile(sanitized);
  }

  // Check data consistency (e.g., wake time should be after bed time)
  static checkDataConsistency(data: any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check sleep schedule consistency
    if (data.sleepTime && data.wakeTime) {
      const bedTime = new Date(`2000-01-01T${data.sleepTime}`);
      const wakeTime = new Date(`2000-01-01T${data.wakeTime}`);
      
      if (wakeTime <= bedTime) {
        issues.push('Wake time must be after bed time');
      }
    }

    // Check age consistency with birth year
    if (data.birthYear && data.age) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - parseInt(data.birthYear);
      
      if (Math.abs(calculatedAge - data.age) > 1) {
        issues.push('Age does not match birth year');
      }
    }

    // Check BMR and daily calories consistency
    if (data.bmr && data.dailyCalories) {
      const minCalories = data.bmr * 1.1; // Minimum should be BMR + 10%
      const maxCalories = data.bmr * 2.5; // Maximum reasonable multiplier
      
      if (data.dailyCalories < minCalories) {
        issues.push('Daily calories seem too low for your BMR');
      }
      
      if (data.dailyCalories > maxCalories) {
        issues.push('Daily calories seem too high for your BMR');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Comprehensive validation with consistency checks
  static comprehensiveValidation(data: any, type: 'profile' | 'sleep' | 'steps' | 'meal' | 'water' | 'workout') {
    let validationResult;
    
    switch (type) {
      case 'profile':
        validationResult = this.validateAndSanitizeUserProfile(data);
        break;
      case 'sleep':
        validationResult = this.validateSleepSession(data);
        break;
      case 'steps':
        validationResult = this.validateStepSession(data);
        break;
      case 'meal':
        validationResult = this.validateMealEntry(data);
        break;
      case 'water':
        validationResult = this.validateWaterIntake(data);
        break;
      case 'workout':
        validationResult = this.validateWorkoutSession(data);
        break;
      default:
        return { success: false, data: null, errors: [{ field: 'type', message: 'Invalid validation type' }] };
    }

    if (!validationResult.success) {
      return validationResult;
    }

    // Check data consistency for profile data
    if (type === 'profile') {
      const consistencyCheck = this.checkDataConsistency(validationResult.data);
      if (!consistencyCheck.isValid) {
        return {
          success: false,
          data: null,
          errors: consistencyCheck.issues.map(issue => ({ field: 'consistency', message: issue }))
        };
      }
    }

    return validationResult;
  }
}

export default DataValidationService;
