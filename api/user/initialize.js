// API endpoint for user initialization in Mini App
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      // Get user data by Telegram ID
      const { telegram_id } = req.query;
      
      if (!telegram_id) {
        return res.status(400).json({ 
          error: "telegram_id parameter is required",
          success: false 
        });
      }

      console.log("🔍 Getting user data for:", telegram_id);

      // Simulate database lookup
      // In production, this would query your actual database
      const userData = {
        telegram_id: telegram_id,
        first_name: "Foydalanuvchi",
        last_name: "",
        username: "",
        language_code: "uz",
        is_premium: false,
        profile_completed: false,
        daily_calorie_goal: 2000,
        daily_water_goal: 8,
        daily_steps_goal: 10000,
        weight_goal: null,
        height: null,
        current_weight: null,
        gender: null,
        birth_date: null,
        activity_level: 'moderate',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      const initData = {
        success: true,
        user: userData,
        onboarding_required: !userData.profile_completed,
        default_goals: {
          calories: userData.daily_calorie_goal,
          water: userData.daily_water_goal,
          steps: userData.daily_steps_goal
        },
        app_config: {
          theme: 'light',
          language: userData.language_code,
          notifications_enabled: true,
          ai_suggestions: true,
          haptic_feedback: true
        },
        features_enabled: {
          food_tracking: true,
          water_tracking: true,
          step_tracking: true,
          sleep_tracking: true,
          workout_tracking: true,
          analytics: true,
          ai_recommendations: true
        }
      };

      console.log("✅ User data retrieved successfully:", telegram_id);
      return res.status(200).json(initData);

    } else if (req.method === "POST") {
      // Initialize/Update user data
      const userData = req.body;
      
      if (!userData.telegram_id) {
        return res.status(400).json({ 
          error: "telegram_id is required",
          success: false 
        });
      }

      console.log("💾 Initializing user data:", userData.telegram_id);

      // Simulate saving to database
      const savedUser = {
        ...userData,
        id: Math.floor(Math.random() * 1000000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completed: false
      };

      // Prepare response
      const response = {
        success: true,
        message: "User initialized successfully",
        user: savedUser,
        onboarding_required: !savedUser.profile_completed,
        next_steps: [
          "Complete profile setup",
          "Set health goals", 
          "Start tracking meals"
        ]
      };

      console.log("✅ User initialized successfully:", userData.telegram_id);
      return res.status(200).json(response);

    } else {
      return res.status(405).json({ 
        error: "Method not allowed",
        success: false 
      });
    }

  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      success: false,
      details: error.message 
    });
  }
}