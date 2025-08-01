import { UserProfile } from "@/contexts/UserContext";

// === INTERFACES ===
export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: WorkoutType;
  duration: number; // minutes
  caloriesBurned: number;
  exercises: Exercise[];
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  startTime: string;
  endTime: string;
  notes?: string;
  location?: string;
  mood: 'excited' | 'motivated' | 'tired' | 'stressed' | 'energetic';
  difficulty: 1 | 2 | 3 | 4 | 5;
  equipment: string[];
  restTime: number; // total rest minutes
  heartRate?: {
    average: number;
    max: number;
    zones: {
      warmup: number; // minutes
      fatBurn: number;
      cardio: number;
      peak: number;
    };
  };
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  category: ExerciseCategory;
  sets: ExerciseSet[];
  totalReps?: number;
  totalWeight?: number; // kg
  duration?: number; // minutes for cardio
  distance?: number; // km for running/cycling
  caloriesBurned: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  muscleGroups: MuscleGroup[];
  equipment: string[];
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds for holds/cardio
  distance?: number; // meters
  restTime: number; // seconds
  completed: boolean;
  notes?: string;
}

export type WorkoutType = 
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'martial_arts'
  | 'dance'
  | 'sports'
  | 'flexibility'
  | 'rehabilitation'
  | 'custom';

export type ExerciseType = 
  | 'strength'
  | 'cardio'
  | 'plyometric'
  | 'isometric'
  | 'flexibility'
  | 'balance'
  | 'coordination'
  | 'endurance';

export type ExerciseCategory = 
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'upper_body'
  | 'lower_body';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body';

export interface WorkoutGoals {
  weeklyWorkouts: number;
  weeklyMinutes: number;
  monthlyWorkouts: number;
  preferredTypes: WorkoutType[];
  intensityPreference: 'low' | 'moderate' | 'high' | 'mixed';
  focusAreas: MuscleGroup[];
  restDays: number; // per week
  sessionDuration: {
    min: number; // minutes
    max: number;
    target: number;
  };
}

export interface WorkoutInsights {
  weeklyStats: {
    totalWorkouts: number;
    totalMinutes: number;
    averageDuration: number;
    caloriesBurned: number;
    mostActiveDay: string;
  };
  monthlyStats: {
    totalWorkouts: number;
    totalMinutes: number;
    averageIntensity: number;
    progressScore: number; // 0-100
  };
  performance: {
    strengthProgress: number; // % improvement
    enduranceProgress: number;
    consistencyScore: number; // 0-100
    personalRecords: PersonalRecord[];
  };
  patterns: {
    preferredTime: string; // HH:MM
    preferredDuration: number;
    mostUsedEquipment: string[];
    favoriteWorkoutTypes: WorkoutType[];
  };
  trends: {
    workoutFrequency: 'increasing' | 'decreasing' | 'stable';
    intensityTrend: 'increasing' | 'decreasing' | 'stable';
    durationTrend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: string[];
  healthBenefits: {
    cardiovascularHealth: number; // 0-100
    muscularStrength: number;
    flexibility: number;
    mentalHealth: number;
  };
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  type: 'max_weight' | 'max_reps' | 'max_duration' | 'best_time' | 'max_distance';
  value: number;
  unit: string;
  date: string;
  previousRecord?: {
    value: number;
    date: string;
  };
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  type: WorkoutType;
  duration: number; // minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  exercises: PlannedExercise[];
  equipment: string[];
  targetCalories: number;
  muscleGroups: MuscleGroup[];
  isCustom: boolean;
}

export interface PlannedExercise {
  exerciseName: string;
  sets: number;
  reps: string; // "8-12" or "30 sec" etc.
  weight?: string; // "bodyweight" or "moderate" etc.
  restTime: number; // seconds
  notes?: string;
}

// === UTILITY FUNCTIONS ===

// Get today's date key
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Calculate calories burned for different workout types
export const calculateWorkoutCalories = (
  type: WorkoutType,
  duration: number, // minutes
  intensity: string,
  weight: number = 70 // kg
): number => {
  // MET values for different workout types and intensities
  const metValues: Record<string, Record<string, number>> = {
    strength: { low: 3.0, moderate: 5.0, high: 6.0, extreme: 8.0 },
    cardio: { low: 4.0, moderate: 6.5, high: 8.5, extreme: 11.0 },
    hiit: { low: 6.0, moderate: 8.0, high: 10.0, extreme: 12.0 },
    yoga: { low: 2.0, moderate: 3.0, high: 4.0, extreme: 5.0 },
    pilates: { low: 2.5, moderate: 3.5, high: 4.5, extreme: 5.5 },
    running: { low: 6.0, moderate: 8.0, high: 10.0, extreme: 12.0 },
    cycling: { low: 4.0, moderate: 6.0, high: 8.0, extreme: 10.0 },
    swimming: { low: 5.0, moderate: 7.0, high: 9.0, extreme: 11.0 },
  };
  
  const met = metValues[type]?.[intensity] || metValues.cardio[intensity] || 6.0;
  
  // Calories = MET × weight (kg) × time (hours)
  return Math.round(met * weight * (duration / 60));
};

// Get or create today's workout data
export const getTodayWorkouts = (telegramId: string): WorkoutSession[] => {
  const todayKey = getTodayKey();
  const storageKey = `workouts_${telegramId}_${todayKey}`;
  
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error('Error parsing workout data:', error);
    }
  }
  
  return [];
};

// Add workout session
export const addWorkoutSession = (telegramId: string, session: Omit<WorkoutSession, 'id'>): WorkoutSession[] => {
  const todayWorkouts = getTodayWorkouts(telegramId);
  
  const newSession: WorkoutSession = {
    ...session,
    id: Date.now().toString(),
  };
  
  const updatedWorkouts = [...todayWorkouts, newSession];
  
  const todayKey = getTodayKey();
  const storageKey = `workouts_${telegramId}_${todayKey}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedWorkouts));
  
  return updatedWorkouts;
};

// Get workout goals
export const getWorkoutGoals = (telegramId: string): WorkoutGoals => {
  const storageKey = `workoutGoals_${telegramId}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing workout goals:', error);
    }
  }
  
  // Default goals
  const defaultGoals: WorkoutGoals = {
    weeklyWorkouts: 3,
    weeklyMinutes: 150, // WHO recommendation
    monthlyWorkouts: 12,
    preferredTypes: ['strength', 'cardio'],
    intensityPreference: 'moderate',
    focusAreas: ['full_body'],
    restDays: 4,
    sessionDuration: {
      min: 20,
      max: 60,
      target: 45,
    },
  };
  
  localStorage.setItem(storageKey, JSON.stringify(defaultGoals));
  return defaultGoals;
};

// Update workout goals
export const updateWorkoutGoals = (telegramId: string, goals: Partial<WorkoutGoals>): WorkoutGoals => {
  const current = getWorkoutGoals(telegramId);
  const updated = { ...current, ...goals };
  
  const storageKey = `workoutGoals_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  
  return updated;
};

// Get workout history
export const getWorkoutHistory = (telegramId: string, days: number = 30): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `workouts_${telegramId}_${dateKey}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        const dayWorkouts = JSON.parse(data) as WorkoutSession[];
        sessions.push(...dayWorkouts);
      } catch (error) {
        console.error('Error parsing workout session:', error);
      }
    }
  }
  
  return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

// Get workout insights
export const getWorkoutInsights = (telegramId: string): WorkoutInsights => {
  const history = getWorkoutHistory(telegramId, 30);
  const weekHistory = getWorkoutHistory(telegramId, 7);
  
  if (history.length === 0) {
    return {
      weeklyStats: {
        totalWorkouts: 0,
        totalMinutes: 0,
        averageDuration: 0,
        caloriesBurned: 0,
        mostActiveDay: 'Monday',
      },
      monthlyStats: {
        totalWorkouts: 0,
        totalMinutes: 0,
        averageIntensity: 0,
        progressScore: 0,
      },
      performance: {
        strengthProgress: 0,
        enduranceProgress: 0,
        consistencyScore: 0,
        personalRecords: [],
      },
      patterns: {
        preferredTime: '09:00',
        preferredDuration: 45,
        mostUsedEquipment: [],
        favoriteWorkoutTypes: [],
      },
      trends: {
        workoutFrequency: 'stable',
        intensityTrend: 'stable',
        durationTrend: 'stable',
      },
      recommendations: ['Mashq qilishni boshlang!'],
      healthBenefits: {
        cardiovascularHealth: 0,
        muscularStrength: 0,
        flexibility: 0,
        mentalHealth: 0,
      },
    };
  }
  
  // Weekly stats
  const weeklyStats = {
    totalWorkouts: weekHistory.length,
    totalMinutes: weekHistory.reduce((sum, w) => sum + w.duration, 0),
    averageDuration: weekHistory.length > 0 ? weekHistory.reduce((sum, w) => sum + w.duration, 0) / weekHistory.length : 0,
    caloriesBurned: weekHistory.reduce((sum, w) => sum + w.caloriesBurned, 0),
    mostActiveDay: 'Monday', // Simplified
  };
  
  // Monthly stats
  const monthlyStats = {
    totalWorkouts: history.length,
    totalMinutes: history.reduce((sum, w) => sum + w.duration, 0),
    averageIntensity: history.length > 0 ? history.reduce((sum, w) => {
      const intensityScore = { low: 1, moderate: 2, high: 3, extreme: 4 };
      return sum + intensityScore[w.intensity];
    }, 0) / history.length : 0,
    progressScore: Math.min(100, (history.length / 20) * 100), // Simplified
  };
  
  // Performance calculations
  const goals = getWorkoutGoals(telegramId);
  const consistencyScore = Math.round((weekHistory.length / goals.weeklyWorkouts) * 100);
  
  // Patterns
  const workoutTypes = history.map(w => w.type);
  const favoriteWorkoutTypes = [...new Set(workoutTypes)].sort((a, b) => 
    workoutTypes.filter(t => t === b).length - workoutTypes.filter(t => t === a).length
  ).slice(0, 3) as WorkoutType[];
  
  const equipment = history.flatMap(w => w.equipment);
  const mostUsedEquipment = [...new Set(equipment)].sort((a, b) => 
    equipment.filter(e => e === b).length - equipment.filter(e => e === a).length
  ).slice(0, 5);
  
  // Preferred time calculation
  const hours = history.map(w => new Date(w.startTime).getHours());
  const preferredHour = hours.length > 0 ? Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length) : 9;
  const preferredTime = `${preferredHour.toString().padStart(2, '0')}:00`;
  
  const preferredDuration = Math.round(weeklyStats.averageDuration);
  
  // Trends calculation
  const firstHalf = history.slice(Math.floor(history.length / 2));
  const secondHalf = history.slice(0, Math.floor(history.length / 2));
  
  const firstHalfFreq = firstHalf.length;
  const secondHalfFreq = secondHalf.length;
  const freqChange = secondHalfFreq - firstHalfFreq;
  
  const workoutFrequency = freqChange > 1 ? 'increasing' 
                         : freqChange < -1 ? 'decreasing' 
                         : 'stable';
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (weekHistory.length < goals.weeklyWorkouts) {
    const deficit = goals.weeklyWorkouts - weekHistory.length;
    recommendations.push(`Bu hafta yana ${deficit} ta mashq qilishingiz kerak`);
  }
  
  if (weeklyStats.totalMinutes < goals.weeklyMinutes) {
    const deficitMinutes = goals.weeklyMinutes - weeklyStats.totalMinutes;
    recommendations.push(`Haftada yana ${deficitMinutes} daqiqa mashq qiling`);
  }
  
  if (consistencyScore < 70) {
    recommendations.push('Muntazam mashq qilish rejimini yarating');
  }
  
  if (favoriteWorkoutTypes.length === 1) {
    recommendations.push('Turli xil mashq turlarini sinab ko\'ring');
  }
  
  if (weeklyStats.averageDuration > goals.sessionDuration.max) {
    recommendations.push('Mashq vaqtini qisqartiring, sifatga e\'tibor bering');
  }
  
  if (weeklyStats.averageDuration < goals.sessionDuration.min) {
    recommendations.push('Mashq vaqtini uzaytiring yoki intensivligini oshiring');
  }
  
  // Health benefits calculation
  const workoutsPerWeek = weekHistory.length;
  const minutesPerWeek = weeklyStats.totalMinutes;
  
  const cardiovascularHealth = Math.min(100, Math.round((minutesPerWeek / goals.weeklyMinutes) * 100));
  const muscularStrength = Math.min(100, Math.round(((workoutsPerWeek / goals.weeklyWorkouts) * 80) + (consistencyScore * 0.2)));
  const flexibility = Math.min(100, Math.round((favoriteWorkoutTypes.includes('yoga') ? 80 : 40) + (consistencyScore * 0.2)));
  const mentalHealth = Math.min(100, Math.round(((workoutsPerWeek / goals.weeklyWorkouts) * 90) + (consistencyScore * 0.1)));
  
  return {
    weeklyStats,
    monthlyStats,
    performance: {
      strengthProgress: 0, // Would need historical data
      enduranceProgress: 0,
      consistencyScore,
      personalRecords: [], // Simplified
    },
    patterns: {
      preferredTime,
      preferredDuration,
      mostUsedEquipment,
      favoriteWorkoutTypes,
    },
    trends: {
      workoutFrequency,
      intensityTrend: 'stable', // Simplified
      durationTrend: 'stable',
    },
    recommendations,
    healthBenefits: {
      cardiovascularHealth,
      muscularStrength,
      flexibility,
      mentalHealth,
    },
  };
};

// Predefined workout plans
export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'beginner_strength',
    name: 'Yangi boshlovchilar uchun',
    description: 'Asosiy kuch mashqlari',
    type: 'strength',
    duration: 30,
    difficulty: 2,
    exercises: [
      { exerciseName: 'Pushup', sets: 3, reps: '8-12', weight: 'bodyweight', restTime: 60 },
      { exerciseName: 'Squat', sets: 3, reps: '10-15', weight: 'bodyweight', restTime: 60 },
      { exerciseName: 'Plank', sets: 3, reps: '30 sec', weight: 'bodyweight', restTime: 45 },
      { exerciseName: 'Lunges', sets: 2, reps: '8 har bir oyoq', weight: 'bodyweight', restTime: 60 },
    ],
    equipment: ['none'],
    targetCalories: 150,
    muscleGroups: ['chest', 'legs', 'core'],
    isCustom: false,
  },
  {
    id: 'cardio_hiit',
    name: 'HIIT Kardio',
    description: 'Yuqori intensivlikli interval training',
    type: 'hiit',
    duration: 20,
    difficulty: 4,
    exercises: [
      { exerciseName: 'Jumping Jacks', sets: 4, reps: '30 sec', weight: 'bodyweight', restTime: 30 },
      { exerciseName: 'Burpees', sets: 4, reps: '20 sec', weight: 'bodyweight', restTime: 40 },
      { exerciseName: 'Mountain Climbers', sets: 4, reps: '30 sec', weight: 'bodyweight', restTime: 30 },
      { exerciseName: 'High Knees', sets: 4, reps: '20 sec', weight: 'bodyweight', restTime: 40 },
    ],
    equipment: ['none'],
    targetCalories: 200,
    muscleGroups: ['full_body'],
    isCustom: false,
  },
  {
    id: 'yoga_flow',
    name: 'Yoga Flow',
    description: 'Relaksatsiya va cho\'zilish',
    type: 'yoga',
    duration: 25,
    difficulty: 2,
    exercises: [
      { exerciseName: 'Sun Salutation', sets: 3, reps: '5 rounds', weight: 'bodyweight', restTime: 30 },
      { exerciseName: 'Warrior Pose', sets: 2, reps: '45 sec har bir tomon', weight: 'bodyweight', restTime: 15 },
      { exerciseName: 'Child\'s Pose', sets: 1, reps: '2 min', weight: 'bodyweight', restTime: 0 },
      { exerciseName: 'Downward Dog', sets: 3, reps: '30 sec', weight: 'bodyweight', restTime: 15 },
    ],
    equipment: ['yoga_mat'],
    targetCalories: 80,
    muscleGroups: ['full_body'],
    isCustom: false,
  },
];

// Add sample workout data
export const addSampleWorkoutData = (telegramId: string, userWeight: number = 70): void => {
  const today = getTodayWorkouts(telegramId);
  if (today.length > 0) return; // Don't add if data already exists
  
  // Add realistic workout data for last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const storageKey = `workouts_${telegramId}_${dateKey}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing && (i === 1 || i === 3 || i === 5)) { // Every other day
      const workoutTypes: WorkoutType[] = ['strength', 'cardio', 'yoga'];
      const type = workoutTypes[i % 3];
      const duration = 30 + Math.floor(Math.random() * 30); // 30-60 minutes
      const intensity = ['moderate', 'high'][Math.floor(Math.random() * 2)] as 'moderate' | 'high';
      
      const startHour = 8 + Math.floor(Math.random() * 12); // 8-20
      const startTime = `${dateKey}T${startHour.toString().padStart(2, '0')}:00:00Z`;
      const endTime = `${dateKey}T${(startHour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}:00Z`;
      
      const sampleWorkout: WorkoutSession = {
        id: `sample_${dateKey}`,
        date: dateKey,
        name: type === 'strength' ? 'Kuch mashqi' : 
              type === 'cardio' ? 'Kardio mashq' : 'Yoga sessiyasi',
        type,
        duration,
        caloriesBurned: calculateWorkoutCalories(type, duration, intensity, userWeight),
        exercises: [], // Simplified
        intensity,
        startTime,
        endTime,
        location: 'Uy',
        mood: 'motivated',
        difficulty: Math.floor(Math.random() * 3) + 2 as 2 | 3 | 4,
        equipment: type === 'strength' ? ['dumbbells'] : 
                  type === 'cardio' ? ['none'] : ['yoga_mat'],
        restTime: Math.floor(duration * 0.2), // 20% rest time
      };
      
      localStorage.setItem(storageKey, JSON.stringify([sampleWorkout]));
    }
  }
};

// Quick workout logging
export const logQuickWorkout = (
  telegramId: string,
  type: WorkoutType,
  duration: number,
  intensity: 'low' | 'moderate' | 'high' = 'moderate',
  userWeight: number = 70
): WorkoutSession[] => {
  const now = new Date();
  const startTime = new Date(now.getTime() - duration * 60000); // duration minutes ago
  
  const quickWorkout: Omit<WorkoutSession, 'id'> = {
    date: getTodayKey(),
    name: `Quick ${type}`,
    type,
    duration,
    caloriesBurned: calculateWorkoutCalories(type, duration, intensity, userWeight),
    exercises: [],
    intensity,
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    mood: 'motivated',
    difficulty: intensity === 'low' ? 2 : intensity === 'moderate' ? 3 : 4,
    equipment: ['none'],
    restTime: Math.floor(duration * 0.1),
  };
  
  return addWorkoutSession(telegramId, quickWorkout);
};

// Workout type labels
export const WORKOUT_TYPE_LABELS: Record<WorkoutType, { label: string; icon: string }> = {
  strength: { label: 'Kuch mashqi', icon: '💪' },
  cardio: { label: 'Kardio', icon: '❤️' },
  hiit: { label: 'HIIT', icon: '🔥' },
  yoga: { label: 'Yoga', icon: '🧘' },
  pilates: { label: 'Pilates', icon: '🤸' },
  crossfit: { label: 'CrossFit', icon: '🏋️' },
  running: { label: 'Yugurish', icon: '🏃' },
  cycling: { label: 'Velosipedda yurish', icon: '🚴' },
  swimming: { label: 'Suzish', icon: '🏊' },
  martial_arts: { label: 'Jang san\'ati', icon: '🥋' },
  dance: { label: 'Raqs', icon: '💃' },
  sports: { label: 'Sport', icon: '⚽' },
  flexibility: { label: 'Cho\'zilish', icon: '🤸' },
  rehabilitation: { label: 'Reabilitatsiya', icon: '🩹' },
  custom: { label: 'Maxsus', icon: '⭐' },
};

// Equipment list
export const EQUIPMENT_LIST = [
  'none', 'dumbbells', 'barbell', 'resistance_bands', 'yoga_mat', 
  'kettlebell', 'medicine_ball', 'pull_up_bar', 'bench', 'treadmill',
  'stationary_bike', 'rowing_machine', 'foam_roller', 'jump_rope',
  'suspension_trainer', 'stability_ball', 'ankle_weights', 'other'
];

// Get weekly workout summary
export const getWeeklyWorkoutSummary = (telegramId: string) => {
  const weekHistory = getWorkoutHistory(telegramId, 7);
  const goals = getWorkoutGoals(telegramId);
  
  const totalWorkouts = weekHistory.length;
  const totalMinutes = weekHistory.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = weekHistory.reduce((sum, w) => sum + w.caloriesBurned, 0);
  
  const workoutProgress = Math.round((totalWorkouts / goals.weeklyWorkouts) * 100);
  const minuteProgress = Math.round((totalMinutes / goals.weeklyMinutes) * 100);
  
  return {
    totalWorkouts,
    totalMinutes,
    totalCalories,
    workoutProgress,
    minuteProgress,
    goalWorkouts: goals.weeklyWorkouts,
    goalMinutes: goals.weeklyMinutes,
    isGoalMet: totalWorkouts >= goals.weeklyWorkouts && totalMinutes >= goals.weeklyMinutes,
  };
};