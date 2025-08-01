const TELEGRAM_BOT_TOKEN = "7644823924:AAG3c4DcG4Ul2mA5z39G6OmlNT8bXrNEal0";

async function setupBotManual() {
  console.log("🤖 Bot setup boshlandi...");
  
  // 1. Bot ma'lumotlarini olish
  try {
    const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    if (botData.ok) {
      console.log("✅ Bot topildi:", botData.result.username);
    } else {
      console.log("❌ Bot xatoligi:", botData.description);
      return;
    }
  } catch (error) {
    console.log("❌ Network xatoligi:", error.message);
    return;
  }

  // 2. Commands o'rnatish
  const commands = [
    { command: "start", description: "🚀 Bot'ni ishga tushirish" },
    { command: "help", description: "📚 Yordam" },
    { command: "app", description: "📱 Mini App'ni ochish" }
  ];

  try {
    const commandsResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });
    
    const commandsData = await commandsResponse.json();
    if (commandsData.ok) {
      console.log("✅ Commands o'rnatildi");
    } else {
      console.log("❌ Commands xatoligi:", commandsData.description);
    }
  } catch (error) {
    console.log("❌ Commands xatoligi:", error.message);
  }

  // 3. Menu button o'rnatish
  try {
    const menuResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: "web_app",
          text: "🥗 Caloria AI",
          web_app: { url: "http://localhost:8080" }
        }
      })
    });
    
    const menuData = await menuResponse.json();
    if (menuData.ok) {
      console.log("✅ Menu button o'rnatildi");
    } else {
      console.log("❌ Menu button xatoligi:", menuData.description);
    }
  } catch (error) {
    console.log("❌ Menu button xatoligi:", error.message);
  }

  console.log("\n🎉 Setup yakunlandi!");
  console.log("📱 Telegram'da bot'ga boring va /start bosing");
}

setupBotManual();