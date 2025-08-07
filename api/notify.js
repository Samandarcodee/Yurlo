// API endpoint to send Telegram notifications via bot (serverless-friendly)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const { chat_id, title, message, template } = req.body || {};

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      // No token configured — pretend success to avoid blocking client UX
      console.warn("TELEGRAM_BOT_TOKEN is not set. Skipping real send.");
      return res.status(200).json({ success: true, simulated: true });
    }

    if (!chat_id) {
      return res.status(400).json({ success: false, error: "chat_id is required" });
    }

    // Simple template map
    const templates = {
      meal_saved: {
        title: "🍽️ Ovqat qo'shildi",
        message: "Yangi ovqat yozuvi saqlandi. Zo'r ish!",
      },
      water_goal: {
        title: "💧 Suv maqsadi bajarildi",
        message: "Bugungi suv maqsadingiz bajarildi. Tabriklaymiz!",
      },
      steps_goal: {
        title: "🏃 Qadam maqsadi bajarildi",
        message: "Kunlik qadam maqsadiga erishdingiz! Davom eting!",
      },
      exercise_added: {
        title: "💪 Mashq qo'shildi",
        message: "Mashq sessiyasi yozildi. Ajoyib!",
      },
      sleep_reminder: {
        title: "🌙 Uyqu eslatmasi",
        message: "Uyqu vaqti yaqinlashdi. Uyqu rejimini yoqing.",
      },
    };

    const payload = template && templates[template]
      ? templates[template]
      : { title: title || "📣 Xabar", message: message || "" };

    const text = `*${payload.title}*\n\n${payload.message}`;

    const tgResp = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text,
          parse_mode: "Markdown",
        }),
      },
    );

    if (!tgResp.ok) {
      const errText = await tgResp.text();
      console.error("Telegram sendMessage failed:", errText);
      return res.status(500).json({ success: false, error: "Telegram API error" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Notify API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

