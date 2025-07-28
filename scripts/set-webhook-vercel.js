/**
 * Vercel uchun webhook o'rnatish scripti
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";
const VERCEL_URL = "https://yurlo.vercel.app";

async function setWebhookForVercel() {
  console.log("🔗 Vercel uchun webhook o'rnatish...\n");

  try {
    const webhookUrl = `${VERCEL_URL}/api/telegram-webhook`;
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: true,
          max_connections: 40,
          secret_token: "caloria_ai_webhook_secret"
        }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Webhook muvaffaqiyatli o'rnatildi!");
      console.log(`   🔗 URL: ${webhookUrl}`);
      console.log("   📊 Allowed updates: message, callback_query");
      console.log("   🗑️  Pending updates tozalandi");
    } else {
      console.error("❌ Webhook o'rnatishda xatolik:", data.description);
      return false;
    }

    // Webhook holatini tekshirish
    console.log("\n🔍 Webhook holatini tekshirish...");
    
    const checkResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const checkData = await checkResponse.json();

    if (checkData.ok) {
      console.log("📋 Webhook ma'lumotlari:");
      console.log(`   🔗 URL: ${checkData.result.url}`);
      console.log(`   📊 Pending updates: ${checkData.result.pending_update_count}`);
      console.log(`   📅 Last error date: ${checkData.result.last_error_date || 'Xatolik yo\'q'}`);
      if (checkData.result.last_error_message) {
        console.log(`   ❌ Last error: ${checkData.result.last_error_message}`);
      }
    }

    console.log("\n🎉 Webhook sozlash yakunlandi!");
    console.log("\n📱 Test qilish:");
    console.log("1. Telegram'da @Yurlo_bot ga boring");
    console.log("2. /start buyrug'ini yuboring");
    console.log("3. Bot javob berishi kerak!");
    console.log("4. Menu tugmasini bosib Mini App'ni oching");

    return true;

  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
    return false;
  }
}

// Webhook o'chirish funksiyasi
async function removeWebhook() {
  console.log("🗑️  Webhook o'chirish...\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drop_pending_updates: true
        }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Webhook o'chirildi va pending updates tozalandi");
    } else {
      console.error("❌ Webhook o'chirishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Command line arguments orqali funksiya tanlash
const command = process.argv[2];

if (command === 'remove') {
  removeWebhook().catch(console.error);
} else {
  setWebhookForVercel().catch(console.error);
}

export { setWebhookForVercel, removeWebhook };
