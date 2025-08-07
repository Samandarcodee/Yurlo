// Vercel serverless function for Telegram webhook

// Simple in-memory storage for registered users (in production, use database)
let registeredUsers = new Set();

export default async function handler(req, res) {
  // CORS headers for Telegram
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const update = req.body;
    console.log("Telegram webhook received:", JSON.stringify(update, null, 2));

    const TELEGRAM_BOT_TOKEN =
      process.env.TELEGRAM_BOT_TOKEN ||
      "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";
    const MINI_APP_URL = process.env.MINI_APP_URL || "https://yurlo.vercel.app";

    // Send message function
    const sendMessage = async (chatId, text, options = {}) => {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            ...options,
          }),
        },
      );
      return response.json();
    };

    // Create inline keyboard for Mini App
    const createMiniAppKeyboard = () => ({
      inline_keyboard: [
        [
          {
            text: "🥗 Caloria AI ochish",
            web_app: { url: MINI_APP_URL },
          },
        ],
        [
          {
            text: "📊 Tezkor hisobot",
            callback_data: "quick_report",
          },
          {
            text: "ℹ️ Yordam",
            callback_data: "help",
          },
        ],
      ],
    });

    // User data collection and storage functions
    const getUserData = async (user) => {
      try {
        const userData = {
          telegram_id: user.id.toString(),
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          username: user.username || "",
          language_code: user.language_code || "uz",
          is_premium: user.is_premium || false,
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          is_new_user: true,
        };

        console.log("💾 User data collected:", userData);
        return userData;
      } catch (error) {
        console.error("❌ Error collecting user data:", error);
        return null;
      }
    };

    // Check if user exists (with real detection)
    const checkExistingUser = async (telegramId) => {
      try {
        console.log(`🔍 Checking existing user: ${telegramId}`);

        // Check in-memory storage
        const isRegistered = registeredUsers.has(telegramId);

        if (isRegistered) {
          console.log(`✅ User ${telegramId} is already registered`);
          return true;
        }

        // In production, you would also check database:
        /*
        const dbUser = await database.findUser({ telegram_id: telegramId });
        return !!dbUser;
        */

        console.log(`🆕 User ${telegramId} is new`);
        return false;
      } catch (error) {
        console.error("❌ Error checking user:", error);
        return false;
      }
    };

    // Register user in memory (in production, save to database)
    const registerUser = async (telegramId) => {
      try {
        registeredUsers.add(telegramId);
        console.log(`📝 User ${telegramId} registered successfully`);
        return true;
      } catch (error) {
        console.error("❌ Error registering user:", error);
        return false;
      }
    };

    // Database simulation (in production, use real database)
    const saveUserToDatabase = async (userData) => {
      try {
        // Simulate saving to database
        console.log("💾 Saving user to database:", userData.telegram_id);

        // In production, you would:
        // 1. Save to PostgreSQL/MongoDB/etc
        // 2. Create user profile with default settings
        // 3. Initialize tracking data

        // For now, we'll simulate with a success response
        const dbUser = {
          ...userData,
          id: Math.floor(Math.random() * 1000000), // Simulate auto-increment ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_completed: false,
          daily_calorie_goal: 2000,
          daily_water_goal: 8,
          daily_steps_goal: 10000,
          weight_goal: null,
          height: null,
          current_weight: null,
          gender: null,
          birth_date: null,
          activity_level: "moderate",
        };

        console.log("✅ User saved to database:", dbUser.id);
        return dbUser;
      } catch (error) {
        console.error("❌ Database save error:", error);
        return null;
      }
    };

    // Send user data to Mini App initialization endpoint
    const initializeUserData = async (userData) => {
      try {
        console.log(
          "🚀 Initializing user data for Mini App:",
          userData.telegram_id,
        );

        // Save to database first
        const dbUser = await saveUserToDatabase(userData);

        if (!dbUser) {
          throw new Error("Failed to save user to database");
        }

        // Prepare initialization data for Mini App
        const initData = {
          user: dbUser,
          onboarding_required: !dbUser.profile_completed,
          default_goals: {
            calories: dbUser.daily_calorie_goal,
            water: dbUser.daily_water_goal,
            steps: dbUser.daily_steps_goal,
          },
          app_config: {
            theme: "light",
            language: userData.language_code,
            notifications_enabled: true,
            ai_suggestions: true,
          },
        };

        // Initialize user via API
        try {
          const apiResponse = await fetch(
            `${MINI_APP_URL}/api/user/initialize`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
            },
          );

          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log("🔗 User initialized via API:", apiData.success);
          } else {
            console.warn("⚠️ API initialization failed, using local data");
          }
        } catch (apiError) {
          console.warn(
            "⚠️ API not available, using local initialization:",
            apiError.message,
          );
        }

        console.log("📱 User initialization data prepared:", {
          telegram_id: userData.telegram_id,
          needs_onboarding: initData.onboarding_required,
        });

        return initData;
      } catch (error) {
        console.error("❌ Error initializing user data:", error);
        return null;
      }
    };

    // Enhanced user activity tracking
    const updateUserActivity = async (telegramId) => {
      try {
        console.log("📈 Updating user activity:", telegramId);

        // In production, update last_active timestamp in database
        const updateData = {
          last_active: new Date().toISOString(),
          bot_interactions: 1, // increment counter
        };

        return true;
      } catch (error) {
        console.error("❌ Error updating user activity:", error);
        return false;
      }
    };

    // Handle /start command with professional user data collection
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const user = update.message.from;

      try {
        // Collect comprehensive user data
        const userData = await getUserData(user);

        if (!userData) {
          throw new Error("Failed to collect user data");
        }

        // Check if user already exists
        const isExistingUser = await checkExistingUser(userData.telegram_id);

        // Update user activity first
        await updateUserActivity(userData.telegram_id);

        const firstName = userData.first_name || "Foydalanuvchi";

        if (isExistingUser) {
          // Existing user - show simplified welcome message
          const returningUserMessage = `👋 <b>Qaytib kelganingizdan xursandmiz, ${firstName}!</b>

🔄 <b>Sizning hisobingiz faol!</b>
📊 Barcha ma'lumotlaringiz saqlanib qolgan.

📱 <b>Davom etish uchun Mini App'ni oching:</b>
• 📈 Bugungi progress'ni ko'ring
• 🥗 Ovqat qo'shing
• 💧 Suv iste'molini kuzating
• 📊 Analytics'ni ko'ring

<i>💡 Maslahat: Mini App'da barcha funksiyalar mavjud!</i>`;

          await sendMessage(chatId, returningUserMessage, {
            reply_markup: createMiniAppKeyboard(),
          });

          console.log(`👋 Returning user welcomed: ${userData.telegram_id}`);
        } else {
          // New user - full registration process
          console.log(
            `🆕 New user registration started: ${userData.telegram_id}`,
          );

          // Initialize user data for Mini App
          const initData = await initializeUserData(userData);

          if (!initData) {
            throw new Error("Failed to initialize user data");
          }

          // Register user to prevent duplicate registration
          await registerUser(userData.telegram_id);

          // New user welcome message with full onboarding (without exposing personal details)
          const newUserMessage = `🌟 <b>Salom ${firstName}! Caloria AI'ga xush kelibsiz!</b>

🎉 <b>Birinchi marta foydalanayapsiz!</b>
✨ Keling, sog'liq sayohatingizni boshlaylik!

🤖 <b>Men sizning shaxsiy AI sog'liq yordamchingizman:</b>

<b>📱 Qanday yordam bera olaman:</b>
• 📸 Ovqat rasmini AI tahlil qilish
• 🧮 Kaloriya hisoblash va kuzatuv  
• 💧 Suv iste'moli nazorati
• 🏃 Jismoniy faollik kuzatuvi
• 😴 Uyqu sifati monitoring
• 📊 Professional analytics
• 💡 Shaxsiy AI tavsiyalar

<b>🚀 Boshlash uchun Mini App'ni oching va profilingizni to'ldiring!</b>

<i>💡 Eslatma: Mini App'da full funksiyalar va professional design mavjud!</i>`;

          await sendMessage(chatId, newUserMessage, {
            reply_markup: createMiniAppKeyboard(),
          });

          // Log successful user registration
          console.log(`✅ New user registered successfully:`, {
            telegram_id: userData.telegram_id,
            name: `${userData.first_name} ${userData.last_name}`.trim(),
            username: userData.username,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("❌ Error in /start command:", error);

        // Fallback message if data collection fails
        const fallbackMessage = `🤖 <b>Salom! Caloria AI'ga xush kelibsiz!</b>

❗ Hozirda texnik xatolik yuz berdi, lekin siz Mini App'dan foydalanishingiz mumkin.

Pastdagi tugmani bosing! 👇`;

        await sendMessage(chatId, fallbackMessage, {
          reply_markup: createMiniAppKeyboard(),
        });
      }
    }

    // Handle /app command
    else if (update.message?.text === "/app") {
      const chatId = update.message.chat.id;

      await sendMessage(
        chatId,
        `🥗 <b>Caloria AI Mini App</b>

Ilova tugmasini bosib, sog'liq kuzatuvini boshlang!`,
        {
          reply_markup: createMiniAppKeyboard(),
        },
      );
    }

    // Handle /help command
    else if (update.message?.text === "/help") {
      const chatId = update.message.chat.id;

      const helpMessage = `📚 <b>Caloria AI Yordam</b>

<b>🎯 Asosiy funksiyalar:</b>
• 🥗 Mini App orqali ovqat qo'shish
• 📊 Kunlik progress kuzatuvi
• 💧 Suv iste'moli nazorati
��� 🏃 Faollik qayd etish
• 🎯 Sog'liq maqsadlari belgilash

<b>⚡ Buyruqlar:</b>
/start - Boshlash
/app - Mini App ochish
/help - Yordam

<b>📱 Mini App'ni ochish:</b>
• Pastdagi tugmani bosing
• Yoki menu tugmasidan foydalaning`;

      await sendMessage(chatId, helpMessage, {
        reply_markup: createMiniAppKeyboard(),
      });
    }

    // Handle callback queries (button presses)
    else if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message?.chat.id;
      const messageId = update.callback_query.message?.message_id;

      if (chatId) {
        if (callbackData === "quick_report") {
          try {
            // Get user data from API
            const user = update.callback_query.from;
            const telegramId = user.id.toString();

            // Update user activity
            await updateUserActivity(telegramId);

            // Try to get real user data
            let reportData = {
              meals: 0,
              maxMeals: 3,
              calories: 0,
              maxCalories: 2000,
              water: 0,
              maxWater: 8,
              activity: 0,
              steps: 0,
              maxSteps: 10000,
            };

            try {
              // In production, fetch from API
              const userResponse = await fetch(
                `${MINI_APP_URL}/api/user/initialize?telegram_id=${telegramId}`,
              );
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.success) {
                  reportData.maxCalories = userData.default_goals.calories;
                  reportData.maxWater = userData.default_goals.water;
                  reportData.maxSteps = userData.default_goals.steps;
                }
              }
            } catch (error) {
              console.warn("⚠️ Could not fetch user goals, using defaults");
            }

            // Calculate progress percentages
            const calorieProgress = Math.round(
              (reportData.calories / reportData.maxCalories) * 100,
            );
            const waterProgress = Math.round(
              (reportData.water / reportData.maxWater) * 100,
            );
            const stepProgress = Math.round(
              (reportData.steps / reportData.maxSteps) * 100,
            );

            // Create progress bars
            const createProgressBar = (percentage) => {
              const filled = Math.floor(percentage / 10);
              const empty = 10 - filled;
              return "▓".repeat(filled) + "░".repeat(empty) + ` ${percentage}%`;
            };

            const reportMessage = `📊 <b>Tezkor Hisobot - ${user.first_name}</b>

📅 <b>Bugungi natijalar:</b>

🥗 <b>Ovqatlar:</b> ${reportData.meals}/${reportData.maxMeals} ta
${reportData.meals === 0 ? "🔴" : reportData.meals < reportData.maxMeals ? "🟡" : "🟢"} ${reportData.meals === 0 ? "Hali ovqat qo'shilmagan" : reportData.meals >= reportData.maxMeals ? "Maqsad bajarildi!" : "Davom eting!"}

🔥 <b>Kaloriyalar:</b> ${reportData.calories}/${reportData.maxCalories} kcal
${createProgressBar(calorieProgress)}

💧 <b>Suv iste'moli:</b> ${reportData.water}/${reportData.maxWater} stakan  
${createProgressBar(waterProgress)}

🏃 <b>Qadamlar:</b> ${reportData.steps.toLocaleString()}/${reportData.maxSteps.toLocaleString()}
${createProgressBar(stepProgress)}

⏱️ <b>Faollik:</b> ${reportData.activity} daqiqa

${
  calorieProgress < 50 && waterProgress < 50 && stepProgress < 50
    ? "💪 <b>Bugun yanada faol bo'ling!</b>"
    : calorieProgress >= 80 && waterProgress >= 80 && stepProgress >= 80
      ? "🎉 <b>Ajoyib natija! Davom eting!</b>"
      : "👍 <b>Yaxshi ketayapti, davom eting!</b>"
}

<i>Oxirgi yangilanish: ${new Date().toLocaleTimeString("uz-UZ")}</i>

📱 Batafsil ma'lumot va yangilanish uchun Mini App'ni oching! 👇`;

            await sendMessage(chatId, reportMessage, {
              reply_markup: createMiniAppKeyboard(),
            });
          } catch (error) {
            console.error("❌ Error generating quick report:", error);

            // Fallback message
            await sendMessage(
              chatId,
              `📊 <b>Tezkor Hisobot</b>

❗ Hozirda ma'lumotlarni yuklashda xatolik yuz berdi.

📱 To'liq hisobot uchun Mini App'ni oching! 👇`,
              {
                reply_markup: createMiniAppKeyboard(),
              },
            );
          }
        } else if (callbackData === "help") {
          await sendMessage(
            chatId,
            `💡 <b>Tezkor Yordam</b>

🔹 Mini App orqali ovqat qo'shing
🔹 Har kuni 8 stakan suv iching
🔹 Progress'ingizni kuzatib boring
🔹 AI tavsiyalarni bajaring

Batafsil funksiyalar uchun Mini App'ni oching!`,
            {
              reply_markup: createMiniAppKeyboard(),
            },
          );
        }

        // Answer callback query to remove loading
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "✅ Bajarildi",
            }),
          },
        );
      }
    }

    // Default response for other messages
    else if (update.message?.text && !update.message.text.startsWith("/")) {
      const chatId = update.message.chat.id;

      await sendMessage(
        chatId,
        `🤖 <b>Salom!</b>

Men Caloria AI botiman. Sizga yordam berish uchun Mini App'ni ishlatishingiz kerak.

Pastdagi tugmani bosing! 👇`,
        {
          reply_markup: createMiniAppKeyboard(),
        },
      );
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
