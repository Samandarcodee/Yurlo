import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://naylpbrfthgqwvlzchnr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heWxwYnJmdGhncXd2bHpjaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTM4NzUsImV4cCI6MjA2OTcyOTg3NX0.3DX65_giM-rYEG0iprd8qf4-eySPkJfMOicM9IutseA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id?: string;
  telegram_id: string;
  name: string;
  gender: string;
  birth_year: string;
  age: number;
  height: string;
  weight: string;
  activity_level: string;
  goal: string;
  sleep_time?: string;
  wake_time?: string;
  language: string;
  bmr: number;
  daily_calories: number;
  is_first_time: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SleepSession {
  id?: string;
  user_id: string;
  date: string;
  bed_time: string;
  wake_time: string;
  duration: number;
  quality: number;
  notes?: string;
  created_at?: string;
}

export interface StepSession {
  id?: string;
  user_id: string;
  date: string;
  steps: number;
  distance: number;
  calories: number;
  duration: number;
  avg_pace?: number;
  created_at?: string;
}

export interface MealEntry {
  id?: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  created_at?: string;
}

// Database service functions
export const databaseService = {
  // User Profile
  async getUserProfile(telegramId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  },

  async updateUserProfile(telegramId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  },

  // Sleep Sessions
  async getSleepSessions(userId: string, date?: string): Promise<SleepSession[]> {
    let query = supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching sleep sessions:', error);
      return [];
    }
    
    return data || [];
  },

  async createSleepSession(session: Omit<SleepSession, 'id' | 'created_at'>): Promise<SleepSession | null> {
    const { data, error } = await supabase
      .from('sleep_sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating sleep session:', error);
      return null;
    }
    
    return data;
  },

  // Step Sessions
  async getStepSessions(userId: string, date?: string): Promise<StepSession[]> {
    let query = supabase
      .from('step_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching step sessions:', error);
      return [];
    }
    
    return data || [];
  },

  async createStepSession(session: Omit<StepSession, 'id' | 'created_at'>): Promise<StepSession | null> {
    const { data, error } = await supabase
      .from('step_sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating step session:', error);
      return null;
    }
    
    return data;
  },

  async updateStepSession(sessionId: string, updates: Partial<StepSession>): Promise<StepSession | null> {
    const { data, error } = await supabase
      .from('step_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating step session:', error);
      return null;
    }
    
    return data;
  },

  // Meal Entries
  async getMealEntries(userId: string, date?: string): Promise<MealEntry[]> {
    let query = supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching meal entries:', error);
      return [];
    }
    
    return data || [];
  },

  async createMealEntry(meal: Omit<MealEntry, 'id' | 'created_at'>): Promise<MealEntry | null> {
    const { data, error } = await supabase
      .from('meal_entries')
      .insert([meal])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating meal entry:', error);
      return null;
    }
    
    return data;
  },

  async deleteMealEntry(mealId: string): Promise<boolean> {
    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', mealId);
    
    if (error) {
      console.error('Error deleting meal entry:', error);
      return false;
    }
    
    return true;
  }
}; 