/**
 * Telegram Bot Setup Script
 * Bu script Telegram botini sozlash uchun ishlatiladi
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";
const MINI_APP_URL =
  process.env.MINI_APP_URL || "https://caloria-ai.netlify.app";

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

// Bot commandlarini o'rnatish
async function setBotCommands() {
  try {
    const commands = [
      { command: "start", description: "🌟 Botni boshlash" },
      { command: "help", description: "📚 Yordam va ma'lumot" },
      { command: "report", description: "📊 Bugungi hisobot" },
      { command: "settings", description: "⚙️ Sozlamalar" },
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
      console.log("✅ Bot commandlari o'rnatildi:");
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

// Menu button o'rnatish
async function setMenuButton() {
  try {
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
      console.log("✅ Menu button o'rnatildi:");
      console.log(`   🔗 URL: ${MINI_APP_URL}`);
      console.log(`   📝 Text: ${menuButton.text}`);
    } else {
      console.error("❌ Menu button o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Bot tavsifini o'rnatish
async function setBotDescription() {
  try {
    const description = `🥗 Caloria AI - Sizning aqlli sog'liq yordamchingiz!

AI yordamida ovqat kaloriyalarini hisoblayman va sog'liq maqsadlaringizga erishishda yordam beraman.

Xususiyatlar:
• 📸 Ovqat rasmini tahlil qilish
• 🧮 Kaloriya hisoblash
• 📊 Sog'liq kuzatuvi
• 💡 Shaxsiy AI tavsiyalar
• 📈 Progress tahlili

Boshlash uchun /start ni bosing!`;

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
      console.log("✅ Bot tavsifi o'rnatildi");
    } else {
      console.error("❌ Bot tavsifini o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Qisqa tavsif o'rnatish
async function setShortDescription() {
  try {
    const shortDescription =
      "🥗 AI yordamida sog'liq kuzatuvi va kaloriya hisoblash";

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyShortDescription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ short_description: shortDescription }),
      },
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Qisqa tavsif o'rnatildi");
    } else {
      console.error("❌ Qisqa tavsifni o'rnatishda xatolik:", data.description);
    }
  } catch (error) {
    console.error("❌ Network xatoligi:", error.message);
  }
}

// Asosiy setup funksiyasi
async function setupBot() {
  console.log("🚀 Telegram Bot Setup boshlandi...\n");

  const botInfo = await getBotInfo();
  if (!botInfo) {
    console.error("❌ Bot setup to'xtatildi - bot ma'lumotlari olinmadi");
    return;
  }

  console.log("\n📝 Bot sozlamalarini o'rnatish...");
  await setBotCommands();
  await setMenuButton();
  await setBotDescription();
  await setShortDescription();

  console.log("\n🎉 Bot setup yakunlandi!");
  console.log("\n📋 Keyingi qadamlar:");
  console.log("1. ✅ Bot yaratildi va sozlandi");
  console.log("2. 📱 Telegram'da @" + botInfo.username + " ga boring");
  console.log("3. 🚀 /start buyrug'ini yuboring");
  console.log("4. 🥗 Menu tugmasini bosib Mini App'ni oching");
  console.log("\n🔗 Mini App URL:", MINI_APP_URL);
}

// Script ishga tushirish
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBot().catch(console.error);
}

export { setupBot, getBotInfo, setBotCommands, setMenuButton };
