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
    const { chat_id, title, message, template, lang } = req.body || {};

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      // No token configured — pretend success to avoid blocking client UX
      console.warn("TELEGRAM_BOT_TOKEN is not set. Skipping real send.");
      return res.status(200).json({ success: true, simulated: true });
    }

    if (!chat_id) {
      return res.status(400).json({ success: false, error: "chat_id is required" });
    }

    // Localized templates
    const L = (lang || 'uz').toLowerCase();
    const T = {
      uz: {
        meal_saved: { title: "🍽️ Ovqat qo'shildi", message: "Yangi ovqat yozuvi saqlandi. Zo'r ish!" },
        water_goal: { title: "💧 Suv maqsadi bajarildi", message: "Bugungi suv maqsadingiz bajarildi. Tabriklaymiz!" },
        steps_goal: { title: "🏃 Qadam maqsadi bajarildi", message: "Kunlik qadam maqsadiga erishdingiz! Davom eting!" },
        exercise_added: { title: "💪 Mashq qo'shildi", message: "Mashq sessiyasi yozildi. Ajoyib!" },
        sleep_reminder: { title: "🌙 Uyqu eslatmasi", message: "Uyqu vaqti yaqinlashdi. Uyqu rejimini yoqing." },
      },
      ru: {
        meal_saved: { title: "🍽️ Блюдо сохранено", message: "Новая запись о еде добавлена. Отлично!" },
        water_goal: { title: "💧 Цель по воде достигнута", message: "Вы выполнили дневную норму воды. Поздравляем!" },
        steps_goal: { title: "🏃 Цель по шагам достигнута", message: "Вы выполнили дневную цель по шагам! Так держать!" },
        exercise_added: { title: "💪 Тренировка добавлена", message: "Сессия тренировки записана. Отлично!" },
        sleep_reminder: { title: "🌙 Напоминание о сне", message: "Скоро время сна. Включите режим сна." },
      },
      en: {
        meal_saved: { title: "🍽️ Meal saved", message: "New meal has been recorded. Great job!" },
        water_goal: { title: "💧 Water goal reached", message: "You've completed today's water goal. Congrats!" },
        steps_goal: { title: "🏃 Steps goal reached", message: "You hit your daily steps goal! Keep going!" },
        exercise_added: { title: "💪 Exercise added", message: "Workout session logged. Awesome!" },
        sleep_reminder: { title: "🌙 Sleep reminder", message: "It's almost bedtime. Turn on sleep mode." },
      },
    };

    const dict = T[L] || T.uz;
    const payload = template && dict[template]
      ? dict[template]
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

