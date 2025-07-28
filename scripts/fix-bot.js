/**
 * Bot'ni to'g'ri sozlash scripti
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";
const MINI_APP_URL = "https://yurlo.vercel.app";

// Bot nomini to'g'ri o'rnatish
async function fixBotName() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyName`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Caloria AI",
        }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Bot nomi to'g'ri o'rnatildi: Caloria AI");
    } else {
      console.error("❌ Bot nomini o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Bot tavsifini to'g'ri o'rnatish
async function fixBotDescription() {
  try {
    const description = `🥗 Caloria AI - Sizning aqlli sog'liq yordamchingiz!

AI yordamida ovqat kaloriyalarini hisoblayman va sog'liq maqsadlaringizga erishishda yordam beraman.

Xususiyatlar:
• 📸 Ovqat rasmini tahlil qilish
• 🧮 Kaloriya hisoblash
• 📊 Sog'liq kuzatuvi
• 💡 Shaxsiy AI tavsiyalar
• 📈 Progress tahlili

Boshlash uchun /start ni bosing yoki menu tugmasidan foydalaning!`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyDescription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Bot tavsifi to'g'ri o'rnatildi");
    } else {
      console.error("❌ Bot tavsifini o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Webhook'ni o'chirish
async function removeWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drop_pending_updates: true,
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

// Menu button'ni to'g'ri o'rnatish
async function setMenuButton() {
  try {
    const menuButton = {
      type: "web_app",
      text: "🥗 Caloria AI ochish",
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
      console.log("✅ Menu button to'g'ri o'rnatildi:");
      console.log(`   🔗 URL: ${MINI_APP_URL}`);
      console.log(`   📝 Text: ${menuButton.text}`);
    } else {
      console.error("❌ Menu button o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Bot commandlarini to'g'ri o'rnatish
async function setBotCommands() {
  try {
    const commands = [
      { command: "start", description: "🌟 Botni boshlash va Mini App ochish" },
      { command: "app", description: "🥗 Caloria AI Mini App ochish" },
      { command: "help", description: "📚 Yordam va ma'lumot" },
    ];

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commands }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Bot commandlari to'g'ri o'rnatildi:");
      commands.forEach((cmd) => {
        console.log(`   /${cmd.command} - ${cmd.description}`);
      });
    } else {
      console.error("❌ Commandlarni o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Test xabar yuborish
async function sendTestMessage(chatId = null) {
  if (!chatId) {
    console.log("ℹ️  Test xabar uchun chat ID kerak");
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 <b>Caloria AI Bot Test</b>

✅ Bot to'g'ri ishlayapti!

🥗 Caloria AI Mini App'ni ochish uchun:
• Menu tugmasini bosing
• Yoki /app buyrug'ini yuboring

🔗 Bevosita link: ${MINI_APP_URL}`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🥗 Caloria AI ochish",
                  web_app: { url: MINI_APP_URL },
                },
              ],
            ],
          },
        }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Test xabar yuborildi");
    } else {
      console.error("❌ Test xabar yuborishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Asosiy tuzatish funksiyasi
async function fixBot() {
  console.log("🔧 Bot'ni tuzatish boshlandi...\n");

  await fixBotName();
  await fixBotDescription();
  await removeWebhook();
  await setMenuButton();
  await setBotCommands();

  console.log("\n🎉 Bot tuzatish yakunlandi!");
  console.log("\n📋 Bot hozir to'g'ri ishlashi kerak:");
  console.log("1. ✅ Bot nomi: Caloria AI");
  console.log("2. ✅ Menu button: 🥗 Caloria AI ochish");
  console.log("3. ✅ Commands: /start, /app, /help");
  console.log("4. ✅ Webhook o'chirildi");
  console.log("\n📱 Test qilish:");
  console.log("• Telegram'da @Yurlo_bot ga /start yuboring");
  console.log("• Menu tugmasini bosing");
  console.log(`• Bevosita link: ${MINI_APP_URL}`);
}

// Script ishga tushirish
if (import.meta.url === `file://${process.argv[1]}`) {
  fixBot().catch(console.error);
}

export { fixBot, sendTestMessage };
