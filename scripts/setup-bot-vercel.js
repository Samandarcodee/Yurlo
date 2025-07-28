/**
 * Vercel Telegram Bot Setup Script
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";

// Vercel deployment URL'ini dinamik olish
const getVercelUrl = () => {
  // Vercel environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Manual URL (deploy qilgandan keyin o'zgartiring)
  return (
    process.env.MINI_APP_URL ||
    "https://yurlo.vercel.app"
  );
};

// Bot ma'lumotlarini olish
async function getBotInfo() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`,
    );
    const data = await response.json();

    if (data.ok) {
      console.log("✅ Bot ma'lumotlari:");
      console.log(`   🤖 Nomi: ${data.result.first_name}`);
      console.log(`   📝 Username: @${data.result.username}`);
      console.log(`   🆔 ID: ${data.result.id}`);
      console.log(`   ✅ Bot: ${data.result.is_bot ? "Ha" : "Yo'q"}`);
      return data.result;
    } else {
      console.error("❌ Bot ma'lumotlarini olishda xatolik:", data.description);
      return null;
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
    return null;
  }
}

// Menu button o'rnatish (Vercel URL bilan)
async function setMenuButtonVercel() {
  try {
    const MINI_APP_URL = getVercelUrl();

    const menuButton = {
      type: "web_app",
      text: "🥗 Caloria AI",
      web_app: {
        url: MINI_APP_URL,
      },
    };

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menu_button: menuButton }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Vercel Menu button o'rnatildi:");
      console.log(`   🔗 URL: ${MINI_APP_URL}`);
      console.log(`   📝 Text: ${menuButton.text}`);
    } else {
      console.error("❌ Menu button o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Webhook o'chirish (Vercel static deployment uchun)
async function removeWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Webhook o'chirildi (static deployment uchun)");
    } else {
      console.error("❌ Webhook o'chirishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Asosiy Vercel setup funksiyasi
async function setupBotVercel() {
  console.log("🚀 Vercel Telegram Bot Setup boshlandi...\n");

  const botInfo = await getBotInfo();
  if (!botInfo) {
    console.error("❌ Bot setup to'xtatildi - bot ma'lumotlari olinmadi");
    return;
  }

  console.log("\n📝 Vercel uchun bot sozlamalarini o'rnatish...");
  await setMenuButtonVercel();
  await removeWebhook();

  console.log("\n🎉 Vercel Bot setup yakunlandi!");
  console.log("\n📋 Keyingi qadamlar:");
  console.log("1. ✅ Bot Vercel uchun sozlandi");
  console.log("2. 📱 Telegram'da @" + botInfo.username + " ga boring");
  console.log("3. 🚀 /start buyrug'ini yuboring");
  console.log("4. 🥗 Menu tugmasini bosib Mini App'ni oching");
  console.log("\n🔗 Vercel App URL:", getVercelUrl());
}

// Script ishga tushirish
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBotVercel().catch(console.error);
}

export { setupBotVercel, setMenuButtonVercel, removeWebhook };
