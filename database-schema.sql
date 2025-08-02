-- Yurlo AI Database Schema
-- Supabase PostgreSQL Database

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    birth_year TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 120),
    height TEXT NOT NULL,
    weight TEXT NOT NULL,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal TEXT NOT NULL CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight')),
    sleep_time TEXT,
    wake_time TEXT,
    language TEXT NOT NULL DEFAULT 'uz' CHECK (language IN ('uz', 'ru', 'en')),
    bmr DECIMAL(10,2) NOT NULL,
    daily_calories INTEGER NOT NULL,
    is_first_time BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sleep Sessions Table
CREATE TABLE IF NOT EXISTS sleep_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bed_time TIME NOT NULL,
    wake_time TIME NOT NULL,
    duration DECIMAL(4,2) NOT NULL CHECK (duration >= 0 AND duration <= 24),
    quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Step Sessions Table
CREATE TABLE IF NOT EXISTS step_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER NOT NULL CHECK (steps >= 0),
    distance DECIMAL(8,2) NOT NULL CHECK (distance >= 0),
    calories INTEGER NOT NULL CHECK (calories >= 0),
    duration INTEGER NOT NULL CHECK (duration >= 0),
    avg_pace DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Meal Entries Table
CREATE TABLE IF NOT EXISTS meal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein DECIMAL(6,2) NOT NULL CHECK (protein >= 0),
    carbs DECIMAL(6,2) NOT NULL CHECK (carbs >= 0),
    fat DECIMAL(6,2) NOT NULL CHECK (fat >= 0),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water Intake Table
CREATE TABLE IF NOT EXISTS water_intake (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_ml INTEGER NOT NULL CHECK (amount_ml >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sessions Table
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
    calories_burned INTEGER NOT NULL CHECK (calories_burned >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily_steps', 'daily_calories', 'daily_water', 'sleep_hours')),
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON user_profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date ON sleep_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_step_sessions_user_date ON step_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_type ON user_goals(user_id, goal_type);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policy
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = telegram_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = telegram_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = telegram_id);

-- Sleep Sessions RLS Policy
CREATE POLICY "Users can view own sleep sessions" ON sleep_sessions
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own sleep sessions" ON sleep_sessions
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can update own sleep sessions" ON sleep_sessions
    FOR UPDATE USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- Step Sessions RLS Policy
CREATE POLICY "Users can view own step sessions" ON step_sessions
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own step sessions" ON step_sessions
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can update own step sessions" ON step_sessions
    FOR UPDATE USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- Meal Entries RLS Policy
CREATE POLICY "Users can view own meal entries" ON meal_entries
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own meal entries" ON meal_entries
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can update own meal entries" ON meal_entries
    FOR UPDATE USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete own meal entries" ON meal_entries
    FOR DELETE USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- Water Intake RLS Policy
CREATE POLICY "Users can view own water intake" ON water_intake
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own water intake" ON water_intake
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- Workout Sessions RLS Policy
CREATE POLICY "Users can view own workout sessions" ON workout_sessions
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- User Goals RLS Policy
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (user_id IN (
        SELECT id FROM user_profiles WHERE telegram_id = auth.uid()::text
    ));

-- Functions for Data Aggregation
CREATE OR REPLACE FUNCTION get_user_daily_stats(user_telegram_id TEXT, target_date DATE)
RETURNS TABLE (
    total_calories INTEGER,
    total_steps INTEGER,
    total_water_ml INTEGER,
    sleep_hours DECIMAL(4,2),
    sleep_quality INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(me.calories), 0)::INTEGER as total_calories,
        COALESCE(ss.steps, 0)::INTEGER as total_steps,
        COALESCE(SUM(wi.amount_ml), 0)::INTEGER as total_water_ml,
        COALESCE(sleep.duration, 0) as sleep_hours,
        COALESCE(sleep.quality, 0) as sleep_quality
    FROM user_profiles up
    LEFT JOIN meal_entries me ON up.id = me.user_id AND me.date = target_date
    LEFT JOIN step_sessions ss ON up.id = ss.user_id AND ss.date = target_date
    LEFT JOIN water_intake wi ON up.id = wi.user_id AND wi.date = target_date
    LEFT JOIN sleep_sessions sleep ON up.id = sleep.user_id AND sleep.date = target_date
    WHERE up.telegram_id = user_telegram_id
    GROUP BY up.id, ss.steps, sleep.duration, sleep.quality;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 