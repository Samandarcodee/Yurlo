import {
  getSleepGoals,
  getTodaySleep,
  isBedtimeReminder,
} from "./sleepTracking";

// Sleep notification types
export interface SleepNotification {
  id: string;
  type: "bedtime" | "wakeup" | "reminder" | "insight";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionButton?: {
    text: string;
    action: string;
  };
}

// Get sleep notifications for user
export const getSleepNotifications = (
  telegramId: string,
): SleepNotification[] => {
  const storageKey = `sleepNotifications_${telegramId}`;
  const stored = localStorage.getItem(storageKey);

  try {
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error parsing sleep notifications:", error);
    return [];
  }
};

// Add sleep notification
export const addSleepNotification = (
  telegramId: string,
  notification: Omit<SleepNotification, "id" | "timestamp" | "isRead">,
): void => {
  const notifications = getSleepNotifications(telegramId);

  const newNotification: SleepNotification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  // Add to beginning and keep only last 50 notifications
  const updated = [newNotification, ...notifications].slice(0, 50);

  const storageKey = `sleepNotifications_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
};

// Mark notification as read
export const markNotificationAsRead = (
  telegramId: string,
  notificationId: string,
): void => {
  const notifications = getSleepNotifications(telegramId);
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, isRead: true } : n,
  );

  const storageKey = `sleepNotifications_${telegramId}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));
};

// Check and generate sleep notifications
export const checkSleepNotifications = (
  telegramId: string,
): SleepNotification[] => {
  const goals = getSleepGoals(telegramId);
  const todaySleep = getTodaySleep(telegramId);
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const newNotifications: Omit<
    SleepNotification,
    "id" | "timestamp" | "isRead"
  >[] = [];

  // Bedtime reminder (30 minutes before target bedtime)
  if (isBedtimeReminder(telegramId)) {
    newNotifications.push({
      type: "bedtime",
      title: "🌙 Uyqu vaqti yaqinlashdi",
      message: `${goals.targetBedTime} da yotishga tayyorgarlik ko'ring. Telefon va ekranlarni o'chiring.`,
      priority: "high",
      actionButton: {
        text: "Uyqu rejimini yoqish",
        action: "enable_sleep_mode",
      },
    });
  }

  // Wake up reminder (if sleep was logged)
  const targetWakeMinutes =
    parseInt(goals.targetWakeTime.split(":")[0]) * 60 +
    parseInt(goals.targetWakeTime.split(":")[1]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (Math.abs(currentMinutes - targetWakeMinutes) <= 15 && !todaySleep) {
    newNotifications.push({
      type: "wakeup",
      title: "☀️ Xayrli tong!",
      message: "Uyqungiz qanday o'tdi? Bugungi uyqu ma'lumotlarini kiriting.",
      priority: "medium",
      actionButton: {
        text: "Uyqu yozish",
        action: "log_sleep",
      },
    });
  }

  // Weekly sleep reminder (if no sleep data for 3+ days)
  const last3Days = Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  const hasSleepData = last3Days.some((date) => {
    const storageKey = `sleep_${telegramId}_${date}`;
    return localStorage.getItem(storageKey) !== null;
  });

  if (!hasSleepData && now.getHours() === 10) {
    // 10 AM reminder
    newNotifications.push({
      type: "reminder",
      title: "📊 Uyqu tracking eslatmasi",
      message:
        "Uyqu ma'lumotlaringizni kuzatib boring! Yaxshi uyqu sog'ligingiz kaliti.",
      priority: "low",
      actionButton: {
        text: "Uyqu tracker",
        action: "open_sleep_tracker",
      },
    });
  }

  // Sleep quality insights (weekly, on Sundays)
  if (now.getDay() === 0 && now.getHours() === 9) {
    // Sunday 9 AM
    newNotifications.push({
      type: "insight",
      title: "🎯 Haftalik uyqu hisoboti",
      message:
        "O'tgan hafta uyqu statistikangizni ko'ring va kelgusi hafta uchun maqsad qo'ying.",
      priority: "medium",
      actionButton: {
        text: "Hisobotni ko'rish",
        action: "view_sleep_insights",
      },
    });
  }

  // Add new notifications to storage
  newNotifications.forEach((notification) => {
    addSleepNotification(telegramId, notification);
  });

  return getSleepNotifications(telegramId).filter((n) => !n.isRead);
};

// Sleep mode suggestions
export const getSleepModeTips = (): string[] => {
  return [
    "📱 Telefon va barcha ekranlarni o'chiring",
    "🌡️ Xona haroratini 18-22°C orasida ushlab turing",
    "🔇 Shovqinni kamaytiring yoki quloq tiqinlaridan foydalaning",
    "💡 Yoruglikni to'liq o'chiring yoki ko'z bog'ichidan foydalaning",
    "☕ Kofein va alkogoldan saqlaning",
    "🧘 Chuqur nafas olish yoki meditatsiya qiling",
    "📖 Yengil kitob o'qing yoki tinch musiqa tinglang",
    "🛏️ To'shakni faqat uyqu uchun ishlating",
  ];
};

// Sleep optimization suggestions based on data
export const getSleepOptimizationTips = (
  averageDuration: number,
  averageQuality: number,
  consistencyScore: number,
): string[] => {
  const tips: string[] = [];

  if (averageDuration < 7) {
    tips.push(
      "⏰ Uyqu vaqtingizni oshiring - kamida 7-8 soat uxlashga harakat qiling",
    );
    tips.push("🕒 Ertaroq yotishga harakat qiling va telefon vaqtini cheklang");
  }

  if (averageQuality < 3.5) {
    tips.push(
      "🌡️ Uyqu muhitini optimallashtiring - harorat, yoruglik va shovqin",
    );
    tips.push("🥛 Uxlashdan oldin iliq sut yoki chamomile choy iching");
    tips.push("🧘 Uxlashdan oldin relaksatsiya mashqlarini bajaring");
  }

  if (consistencyScore < 70) {
    tips.push(
      "⏰ Har kuni bir xil vaqtda yoting va turing - dam olish kunlarida ham",
    );
    tips.push("📅 Uyqu jadvalingizni belgilang va unga rioya qiling");
  }

  if (averageDuration > 9) {
    tips.push("⚡ Haddan tashqari ko'p uxlamang - bu sizni charchashi mumkin");
    tips.push("🌅 Ertalab quyosh nurida vaqt o'tkazing");
  }

  // General tips if all metrics are good
  if (tips.length === 0) {
    tips.push("✅ Uyqu sifatingiz yaxshi! Joriy rejimingizni davom ettiring");
    tips.push("🎯 Yangi maqsadlar qo'ying: masalan, uyqu oldidan o'qish");
    tips.push("📊 Uyqu ma'lumotlaringizni kuzatishda davom eting");
  }

  return tips;
};

// Get sleep score color
export const getSleepScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

// Get sleep score badge
export const getSleepScoreBadge = (
  score: number,
): { text: string; color: string } => {
  if (score >= 80)
    return { text: "A'lo", color: "bg-green-100 text-green-800" };
  if (score >= 60)
    return { text: "Yaxshi", color: "bg-yellow-100 text-yellow-800" };
  if (score >= 40)
    return { text: "O'rtacha", color: "bg-orange-100 text-orange-800" };
  return { text: "Yomon", color: "bg-red-100 text-red-800" };
};
