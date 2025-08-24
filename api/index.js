// Vercel API function for Telegram Mini App
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://naylpbrfthgqwvlzchnr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heWxwYnJmdGhncXd2bHpjaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTM4NzUsImV4cCI6MjA2OTcyOTg3NX0.3DX65_giM-rYEG0iprd8qf4-eySPkJfMOicM9IutseA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example API routes
app.get('/api/ping', (req, res) => {
  const ping = process.env.PING_MESSAGE || 'pong';
  res.json({ message: ping });
});

// User Profile API routes
app.post('/api/user/profile', async (req, res) => {
  try {
    const profileData = req.body;
    
    // Validate required fields
    if (!profileData.telegramId || !profileData.name || !profileData.gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', profileData.telegramId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', profileData.telegramId)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Profile updated successfully', data });
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          telegram_id: profileData.telegramId,
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
          is_first_time: profileData.isFirstTime
        }])
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Profile created successfully', data });
    }
  } catch (error) {
    console.error('Error in profile creation/update:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', async (req, res) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.json({ message: 'Profile retrieved successfully', data });
  } catch (error) {
    console.error('Error retrieving profile:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const { telegramId, ...updates } = req.body;
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Profile updated successfully', data });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/user/profile', async (req, res) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('telegram_id', telegramId);

    if (error) throw error;
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/recommendations', async (req, res) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    // Get user profile for personalized recommendations
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Generate personalized recommendations based on user data
    const recommendations = generatePersonalizedRecommendations(profile);
    
    res.json({ 
      message: 'AI recommendations generated successfully', 
      telegramId,
      recommendations 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic data endpoints
app.get('/api/sleep-sessions', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ message: 'Sleep sessions retrieved successfully', data: data || [] });
  } catch (error) {
    console.error('Error retrieving sleep sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sleep-sessions', async (req, res) => {
  try {
    const { userId, date, bedTime, wakeTime, duration, quality, notes } = req.body;
    if (!userId || !date || !bedTime || !wakeTime) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('sleep_sessions')
      .insert([{
        user_id: userId,
        date,
        bed_time: bedTime,
        wake_time: wakeTime,
        duration: duration || 0,
        quality: quality || 5,
        notes: notes || ''
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Sleep session created successfully', data });
  } catch (error) {
    console.error('Error creating sleep session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/step-sessions', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = supabase
      .from('step_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ message: 'Step sessions retrieved successfully', data: data || [] });
  } catch (error) {
    console.error('Error retrieving step sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/step-sessions', async (req, res) => {
  try {
    const { userId, date, steps, distance, calories, duration } = req.body;
    if (!userId || !date || !steps) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('step_sessions')
      .insert([{
        user_id: userId,
        date,
        steps,
        distance: distance || 0,
        calories: calories || 0,
        duration: duration || 0
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Step session created successfully', data });
  } catch (error) {
    console.error('Error creating step session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/step-sessions', async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const { data, error } = await supabase
      .from('step_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Step session updated successfully', data });
  } catch (error) {
    console.error('Error updating step session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meal-entries', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ message: 'Meal entries retrieved successfully', data: data || [] });
  } catch (error) {
    console.error('Error retrieving meal entries:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meal-entries', async (req, res) => {
  try {
    const { userId, name, calories, protein, carbs, fat, mealType, date } = req.body;
    if (!userId || !name || !calories || !mealType || !date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('meal_entries')
      .insert([{
        user_id: userId,
        name,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        meal_type: mealType,
        date
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Meal entry created successfully', data });
  } catch (error) {
    console.error('Error creating meal entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/meal-entries', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const { error } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Meal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Telegram Bot API routes
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Telegram webhook received:', update);

    // Handle different types of updates
    if (update.message) {
      await handleTelegramMessage(update.message);
    } else if (update.callback_query) {
      await handleTelegramCallback(update.callback_query);
    }

    res.json({ message: 'Telegram webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function generatePersonalizedRecommendations(profile) {
  const recommendations = [];
  
  // Basic health recommendations
  recommendations.push('Stay hydrated throughout the day');
  recommendations.push('Aim for 7-9 hours of sleep');
  
  // Activity-based recommendations
  if (profile.activity_level === 'sedentary') {
    recommendations.push('Try to take short walks every hour');
    recommendations.push('Consider starting with light exercises');
  } else if (profile.activity_level === 'moderate') {
    recommendations.push('Maintain your current activity level');
    recommendations.push('Consider adding strength training');
  } else if (profile.activity_level === 'active') {
    recommendations.push('Great job staying active!');
    recommendations.push('Consider cross-training to prevent injury');
  }
  
  // Goal-based recommendations
  if (profile.goal === 'lose') {
    recommendations.push('Create a moderate calorie deficit');
    recommendations.push('Focus on protein-rich foods');
  } else if (profile.goal === 'gain') {
    recommendations.push('Increase your calorie intake gradually');
    recommendations.push('Include strength training in your routine');
  } else if (profile.goal === 'maintain') {
    recommendations.push('Keep your current healthy habits');
    recommendations.push('Monitor your weight regularly');
  }
  
  // Age-based recommendations
  if (profile.age > 50) {
    recommendations.push('Consider bone-strengthening exercises');
    recommendations.push('Get regular health checkups');
  }
  
  return recommendations;
}

async function handleTelegramMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  
  if (text === '/start') {
    // Send welcome message
    console.log(`Sending welcome message to chat ${chatId}`);
  } else if (text === '/profile') {
    // Send profile information
    console.log(`Sending profile info to chat ${chatId}`);
  }
}

async function handleTelegramCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  console.log(`Handling callback query: ${data} for chat ${chatId}`);
}

// Catch-all for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app;
