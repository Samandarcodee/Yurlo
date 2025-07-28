import express from "express";
import TelegramService from "../services/telegram.js";

const router = express.Router();
const telegramService = TelegramService.getInstance();

// Webhook endpoint - Telegram'dan kelgan updatelarni qabul qilish
router.post("/webhook", async (req, res) => {
  await telegramService.handleWebhook(req, res);
});

// Bot ma'lumotlarini olish
router.get("/bot-info", async (req, res) => {
  try {
    const botInfo = await telegramService.getBotInfo();
    res.json({
      success: true,
      data: botInfo,
    });
  } catch (error) {
    console.error("Bot ma'lumotlarini olishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Bot ma'lumotlarini olib bo'lmadi",
    });
  }
});

// Webhook o'rnatish (faqat development uchun)
router.post("/set-webhook", async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        message: "webhookUrl talab qilinadi",
      });
    }

    const result = await telegramService.setWebhook(webhookUrl);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Webhook o'rnatishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Webhook o'rnatishda xatolik",
    });
  }
});

// Test xabar yuborish
router.post("/send-test-message", async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        message: "chatId va message talab qilinadi",
      });
    }

    const result = await telegramService.sendMessage(chatId, message);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Test xabar yuborishda xatolik:", error);
    res.status(500).json({
      success: false,
      message: "Xabar yuborishda xatolik",
    });
  }
});

// WebApp data validation
router.post("/validate-webapp-data", async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({
        success: false,
        message: "initData talab qilinadi",
      });
    }

    const user = telegramService.validateWebAppData(initData);

    if (user) {
      res.json({
        success: true,
        data: { user, validated: true },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Yaroqsiz WebApp ma'lumotlari",
      });
    }
  } catch (error) {
    console.error("WebApp data validation xatoligi:", error);
    res.status(500).json({
      success: false,
      message: "Validation xatoligi",
    });
  }
});

export default router;
