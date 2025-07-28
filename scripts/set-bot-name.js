/**
 * Bot nomini to'g'ri o'rnatish scripti
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";

async function setBotNameProperly() {
  console.log("🔧 Bot nomini to'g'rilash...\n");

  try {
    // setMyName API'si bilan bot nomini o'rnatish
    const nameResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyName`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Caloria AI"
        }),
      },
    );

    const nameData = await nameResponse.json();

    if (nameData.ok) {
      console.log("✅ Bot nomi o'rnatildi: Caloria AI");
    } else {
      console.error("❌ Bot nomini o'rnatishda xatolik:", nameData.description);
    }

    // Qisqa tavsif o'rnatish
    const shortDescResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyShortDescription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          short_description: "🥗 AI yordamida sog'liq kuzatuvi"
        }),
      },
    );

    const shortDescData = await shortDescResponse.json();

    if (shortDescData.ok) {
      console.log("✅ Qisqa tavsif o'rnatildi");
    } else {
      console.error("❌ Qisqa tavsif xatoligi:", shortDescData.description);
    }

    // Menu button URL'ini to'g'rilash (/ belgisiz)
    const menuResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu_button: {
            type: "web_app",
            text: "🥗 Caloria AI",
            web_app: {
              url: "https://yurlo.vercel.app"  // / belgisiz
            }
          }
        }),
      },
    );

    const menuData = await menuResponse.json();

    if (menuData.ok) {
      console.log("✅ Menu button URL to'g'rilandi");
    } else {
      console.error("❌ Menu button xatoligi:", menuData.description);
    }

    // Tekshirish
    console.log("\n🔍 Natija tekshirish...");
    
    const checkResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const checkData = await checkResponse.json();
    
    if (checkData.ok) {
      console.log(`   🤖 Bot nomi: ${checkData.result.first_name}`);
      console.log(`   📝 Username: @${checkData.result.username}`);
    }

    const menuCheckResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMenuButton`);
    const menuCheckData = await menuCheckResponse.json();
    
    if (menuCheckData.ok && menuCheckData.result.web_app) {
      console.log(`   🔗 Menu URL: ${menuCheckData.result.web_app.url}`);
    }

    console.log("\n🎉 Bot to'g'ri sozlandi!");
    console.log("\n📱 Hozir test qiling:");
    console.log("1. Telegram'da @Yurlo_bot chatini oching");
    console.log("2. Chatni tozalang (Clear History)");
    console.log("3. /start buyrug'ini yuboring");
    console.log("4. Menu tugmasini bosing");

  } catch (error) {
    console.error("❌ Xatolik:", error.message);
  }
}

// Script ishga tushirish
if (import.meta.url === `file://${process.argv[1]}`) {
  setBotNameProperly().catch(console.error);
}

export { setBotNameProperly };
