// API endpoint for user profile management
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { telegram_id } = req.query;

    if (!telegram_id) {
      return res.status(400).json({
        error: "telegram_id parameter is required",
        success: false,
      });
    }

    if (req.method === "GET") {
      // Get user profile
      console.log("📋 Getting user profile:", telegram_id);

      // Simulate database lookup
      const userProfile = {
        telegram_id: telegram_id,
        first_name: "Foydalanuvchi",
        last_name: "",
        username: "",
        email: null,
        phone: null,
        avatar_url: null,

        // Health data
        height: null, // cm
        current_weight: null, // kg
        weight_goal: null, // kg
        gender: null, // male/female/other
        birth_date: null,
        activity_level: "moderate", // sedentary/light/moderate/active/very_active

        // Goals
        daily_calorie_goal: 2000,
        daily_water_goal: 8, // glasses
        daily_steps_goal: 10000,
        weekly_workout_goal: 150, // minutes
        sleep_goal: 8, // hours

        // Preferences
        units: "metric", // metric/imperial
        language: "uz",
        timezone: "Asia/Tashkent",
        notifications: {
          meal_reminders: true,
          water_reminders: true,
          workout_reminders: true,
          sleep_reminders: true,
          progress_updates: true,
        },

        // Privacy
        data_sharing: false,
        analytics_sharing: true,

        // Status
        profile_completed: false,
        onboarding_completed: false,
        premium_user: false,

        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      console.log("✅ Profile retrieved successfully");
      return res.status(200).json({
        success: true,
        profile: userProfile,
      });
    } else if (req.method === "POST" || req.method === "PUT") {
      // Update user profile
      const updates = req.body;

      console.log("💾 Updating user profile:", telegram_id);
      console.log("📝 Updates:", Object.keys(updates));

      // Validate required fields for profile completion
      const requiredFields = [
        "height",
        "current_weight",
        "gender",
        "birth_date",
        "activity_level",
      ];
      const providedFields = Object.keys(updates);
      const missingFields = requiredFields.filter(
        (field) => !updates[field] && updates[field] !== 0,
      );

      // Calculate BMI if height and weight provided
      let bmi = null;
      if (updates.height && updates.current_weight) {
        const heightInMeters = updates.height / 100;
        bmi = (
          updates.current_weight /
          (heightInMeters * heightInMeters)
        ).toFixed(1);
      }

      // Simulate saving updates to database
      const updatedProfile = {
        telegram_id: telegram_id,
        ...updates,
        bmi: bmi,
        profile_completed: missingFields.length === 0,
        updated_at: new Date().toISOString(),
      };

      // Calculate recommended daily calories based on profile
      let recommendedCalories = 2000; // default
      if (
        updates.gender &&
        updates.height &&
        updates.current_weight &&
        updates.birth_date
      ) {
        // Simplified BMR calculation (Harris-Benedict)
        const age =
          new Date().getFullYear() - new Date(updates.birth_date).getFullYear();
        let bmr;

        if (updates.gender === "male") {
          bmr =
            88.362 +
            13.397 * updates.current_weight +
            4.799 * updates.height -
            5.677 * age;
        } else {
          bmr =
            447.593 +
            9.247 * updates.current_weight +
            3.098 * updates.height -
            4.33 * age;
        }

        // Activity multiplier
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };

        recommendedCalories = Math.round(
          bmr * (activityMultipliers[updates.activity_level] || 1.55),
        );
      }

      const response = {
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
        recommendations: {
          daily_calories: recommendedCalories,
          daily_water:
            Math.max(8, Math.round(updates.current_weight * 0.033)) || 8, // 33ml per kg
          daily_steps:
            updates.activity_level === "sedentary"
              ? 8000
              : updates.activity_level === "very_active"
                ? 12000
                : 10000,
        },
        profile_completion: {
          completed: updatedProfile.profile_completed,
          missing_fields: missingFields,
          completion_percentage: Math.round(
            ((requiredFields.length - missingFields.length) /
              requiredFields.length) *
              100,
          ),
        },
      };

      console.log("✅ Profile updated successfully");
      console.log(
        "📊 Profile completion:",
        response.profile_completion.completion_percentage + "%",
      );

      return res.status(200).json(response);
    } else {
      return res.status(405).json({
        error: "Method not allowed",
        success: false,
      });
    }
  } catch (error) {
    console.error("❌ Profile API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
      details: error.message,
    });
  }
}
