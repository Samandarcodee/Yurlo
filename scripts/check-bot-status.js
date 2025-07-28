/**
 * Bot holatini tekshirish scripti
 */

const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";

async function checkAllBotSettings() {
  console.log("🔍 Bot holatini tekshirish...\n");

  try {
    // 1. Bot ma'lumotlari
    console.log("1️⃣ Bot ma'lumotlari:");
    const meResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const meData = await meResponse.json();
    
    if (meData.ok) {
      console.log(`   🤖 ID: ${meData.result.id}`);
      console.log(`   📝 Username: @${meData.result.username}`);
      console.log(`   🏷️  First Name: ${meData.result.first_name}`);
      console.log(`   ✅ Is Bot: ${meData.result.is_bot}`);
    }

    // 2. Bot commandlari
    console.log("\n2️⃣ Bot commandlari:");
    const commandsResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyCommands`);
    const commandsData = await commandsResponse.json();
    
    if (commandsData.ok && commandsData.result.length > 0) {
      commandsData.result.forEach(cmd => {
        console.log(`   /${cmd.command} - ${cmd.description}`);
      });
    } else {
      console.log("   ❌ Commandlar o'rnatilmagan");
    }

    // 3. Bot tavsifi
    console.log("\n3️⃣ Bot tavsifi:");
    const descResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyDescription`);
    const descData = await descResponse.json();
    
    if (descData.ok && descData.result.description) {
      console.log(`   📄 Tavsif: ${descData.result.description.substring(0, 100)}...`);
    } else {
      console.log("   ❌ Tavsif o'rnatilmagan");
    }

    // 4. Webhook holati
    console.log("\n4️⃣ Webhook holati:");
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();
    
    if (webhookData.ok) {
      if (webhookData.result.url) {
        console.log(`   🔗 URL: ${webhookData.result.url}`);
        console.log(`   📊 Pending updates: ${webhookData.result.pending_update_count}`);
      } else {
        console.log("   ✅ Webhook o'rnatilmagan (to'g'ri - static deployment uchun)");
      }
    }

    // 5. Menu button
    console.log("\n5️⃣ Menu button holati:");
    const menuResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMenuButton`);
    const menuData = await menuResponse.json();
    
    if (menuData.ok) {
      if (menuData.result.type === "web_app") {
        console.log(`   ✅ Type: ${menuData.result.type}`);
        console.log(`   📝 Text: ${menuData.result.text}`);
        console.log(`   🔗 URL: ${menuData.result.web_app?.url}`);
      } else {
        console.log(`   ❌ Menu button turi: ${menuData.result.type}`);
      }
    }

    console.log("\n🎯 Xulosa:");
    console.log("Bot sozlamalari yuqorida ko'rsatilgan. Agar muammolar bo'lsa:");
    console.log("• npm run bot:fix - Bot'ni qayta sozlash");
    console.log("• Telegram'da bot chatini tozalang");
    console.log("• Qayta /start yuboring");

  } catch (error) {
    console.error("❌ Xatolik:", error.message);
  }
}

// Script ishga tushirish
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAllBotSettings().catch(console.error);
}

export { checkAllBotSettings };
