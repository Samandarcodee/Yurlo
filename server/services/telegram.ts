import { Request, Response } from "express";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  date: number;
  chat: {
    id: number;
    type: string;
    first_name?: string;
    username?: string;
  };
  text?: string;
  web_app_data?: {
    data: string;
    button_text: string;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: any;
}

// Telegram bot API funksiyalari
export class TelegramService {
  private static instance: TelegramService;

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  // Bot ma'lumotlarini olish
  async getBotInfo() {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Bot ma'lumotlarini olishda xatolik:", error);
      throw error;
    }
  }

  // Webhook o'rnatish
  async setWebhook(webhookUrl: string) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query", "inline_query"],
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Webhook o'rnatishda xatolik:", error);
      throw error;
    }
  }

  // Xabar yuborish
  async sendMessage(chatId: number, text: string, options: any = {}) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
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
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Xabar yuborishda xatolik:", error);
      throw error;
    }
  }

  // Inline keyboard yaratish (Mini App tugmasi bilan)
  createMiniAppKeyboard() {
    return {
      inline_keyboard: [
        [
          {
            text: "🥗 Caloria AI ochish",
            web_app: {
              url: process.env.MINI_APP_URL || "https://caloria-ai.netlify.app",
            },
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
    };
  }

  // Webhook handle qilish
  async handleWebhook(req: Request, res: Response) {
    try {
      const update: TelegramUpdate = req.body;

      console.log(
        "Telegram webhook olingan update:",
        JSON.stringify(update, null, 2),
      );

      // /start buyrug'i
      if (update.message?.text === "/start") {
        await this.sendMessage(
          update.message.chat.id,
          `🌟 <b>Caloria AI'ga xush kelibsiz!</b>

🥗 Men sizning shaxsiy sog'liq yordamchingizman. AI yordamida ovqat kaloriyalarini hisoblayman va sog'liq maqsadlaringizga erishishda yordam beraman.

<b>Nima qila olaman:</b>
• 📸 Ovqat rasmini tahlil qilish
• 🧮 Kaloriya hisoblash
• 📊 Sog'liq kuzatuvi
• 💡 AI tavsiyalar
• 📈 Progress tahlili

Boshlash uchun pastdagi tugmani bosing! 👇`,
          {
            reply_markup: this.createMiniAppKeyboard(),
          },
        );
      }

      // /help buyrug'i
      else if (update.message?.text === "/help") {
        await this.sendMessage(
          update.message.chat.id,
          `📚 <b>Caloria AI Yordam</b>

<b>Asosiy funksiyalar:</b>
• 🥗 Mini App orqali ovqat qo'shish
• 📊 Kunlik progress kuzatuvi
• 💧 Suv iste'moli nazorati
• 🏃 Faollik qayd etish
• 🎯 Sog'liq maqsadlari belgilash

<b>Buyruqlar:</b>
/start - Boshlash
/help - Yordam
/report - Tezkor hisobot
/settings - Sozlamalar

Mini App'ni ochish uchun menyudagi tugmani bosing!`,
          {
            reply_markup: this.createMiniAppKeyboard(),
          },
        );
      }

      // /report buyrug'i
      else if (update.message?.text === "/report") {
        await this.sendMessage(
          update.message.chat.id,
          `📊 <b>Bugungi hisobot</b>

🥗 Ovqatlar: 0/3
🔥 Kaloriyalar: 0/2000
💧 Suv: 0/8 stakan
🏃 Faollik: 0 daqiqa

Batafsil ma'lumot uchun Mini App'ni oching! 👇`,
          {
            reply_markup: this.createMiniAppKeyboard(),
          },
        );
      }

      // WebApp data
      else if (update.message?.web_app_data) {
        const webAppData = JSON.parse(update.message.web_app_data.data);
        console.log("WebApp dan kelgan ma'lumot:", webAppData);

        await this.sendMessage(
          update.message.chat.id,
          `✅ Ma'lumot qabul qilindi! 

${JSON.stringify(webAppData, null, 2)}`,
        );
      }

      // Callback query (tugma bosilganda)
      else if (update.callback_query) {
        const callbackData = update.callback_query.data;
        const chatId = update.callback_query.message?.chat.id;

        if (chatId) {
          if (callbackData === "quick_report") {
            await this.sendMessage(chatId, "📊 Tezkor hisobot yuklanmoqda...");
          } else if (callbackData === "help") {
            await this.sendMessage(chatId, "💡 Yordam ma'lumotlari...", {
              reply_markup: this.createMiniAppKeyboard(),
            });
          }
        }
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Webhook handle qilishda xatolik:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // User validation (Mini App'dan kelgan ma'lumotlarni tekshirish)
  validateWebAppData(initData: string): TelegramUser | null {
    try {
      // Bu yerda initData'ni validate qilish kerak
      // Hozircha oddiy implementation
      const params = new URLSearchParams(initData);
      const userParam = params.get("user");

      if (userParam) {
        return JSON.parse(userParam);
      }

      return null;
    } catch (error) {
      console.error("WebApp data validation xatoligi:", error);
      return null;
    }
  }
}

export default TelegramService;
