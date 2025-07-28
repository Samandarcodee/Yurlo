// Vercel serverless function for Telegram webhook
export default async function handler(req, res) {
  // CORS headers for Telegram
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const update = req.body;
    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";
    const MINI_APP_URL = process.env.MINI_APP_URL || "https://yurlo.vercel.app";

    // Send message function
    const sendMessage = async (chatId, text, options = {}) => {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          ...options,
        }),
      });
      return response.json();
    };

    // Create inline keyboard for Mini App
    const createMiniAppKeyboard = () => ({
      inline_keyboard: [
        [
          {
            text: '🥗 Caloria AI ochish',
            web_app: { url: MINI_APP_URL }
          }
        ],
        [
          {
            text: '📊 Tezkor hisobot',
            callback_data: 'quick_report'
          },
          {
            text: 'ℹ️ Yordam',
            callback_data: 'help'
          }
        ]
      ]
    });

    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name || 'Foydalanuvchi';
      
      const welcomeMessage = `🌟 <b>Salom ${firstName}! Caloria AI'ga xush kelibsiz!</b>

🥗 Men sizning shaxsiy sog'liq yordamchingizman. AI yordamida ovqat kaloriyalarini hisoblayman va sog'liq maqsadlaringizga erishishda yordam beraman.

<b>📱 Nima qila olaman:</b>
• 📸 Ovqat rasmini tahlil qilish
• 🧮 Kaloriya hisoblash va kuzatuv
• 📊 Sog'liq monitoring va tahlil
• 💡 Shaxsiy AI tavsiyalar
• 📈 Progress tracking

<b>🚀 Boshlash uchun pastdagi tugmani bosing!</b>`;

      await sendMessage(chatId, welcomeMessage, {
        reply_markup: createMiniAppKeyboard()
      });
    }

    // Handle /app command
    else if (update.message?.text === '/app') {
      const chatId = update.message.chat.id;
      
      await sendMessage(chatId, `🥗 <b>Caloria AI Mini App</b>

Ilova tugmasini bosib, sog'liq kuzatuvini boshlang!`, {
        reply_markup: createMiniAppKeyboard()
      });
    }

    // Handle /help command
    else if (update.message?.text === '/help') {
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
        reply_markup: createMiniAppKeyboard()
      });
    }

    // Handle callback queries (button presses)
    else if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message?.chat.id;
      const messageId = update.callback_query.message?.message_id;
      
      if (chatId) {
        if (callbackData === 'quick_report') {
          await sendMessage(chatId, `📊 <b>Tezkor Hisobot</b>

📅 Bugun:
🥗 Ovqatlar: 0/3
🔥 Kaloriyalar: 0/2000 kcal
💧 Suv: 0/8 stakan
🏃 Faollik: 0 daqiqa

Batafsil ma'lumot uchun Mini App'ni oching! 👇`, {
            reply_markup: createMiniAppKeyboard()
          });
        } else if (callbackData === 'help') {
          await sendMessage(chatId, `💡 <b>Tezkor Yordam</b>

🔹 Mini App orqali ovqat qo'shing
🔹 Har kuni 8 stakan suv iching
🔹 Progress'ingizni kuzatib boring
🔹 AI tavsiyalarni bajaring

Batafsil funksiyalar uchun Mini App'ni oching!`, {
            reply_markup: createMiniAppKeyboard()
          });
        }

        // Answer callback query to remove loading
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: '✅ Bajarildi'
          }),
        });
      }
    }

    // Default response for other messages
    else if (update.message?.text && !update.message.text.startsWith('/')) {
      const chatId = update.message.chat.id;
      
      await sendMessage(chatId, `🤖 <b>Salom!</b>

Men Caloria AI botiman. Sizga yordam berish uchun Mini App'ni ishlatishingiz kerak.

Pastdagi tugmani bosing! 👇`, {
        reply_markup: createMiniAppKeyboard()
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
