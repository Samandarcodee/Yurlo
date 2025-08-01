/**
 * Telegram Bot Integration Service
 * Handles push notifications and daily data collection
 */

export interface TelegramNotification {
  id: string;
  chatId: string;
  message: string;
  type: 'reminder' | 'achievement' | 'motivation' | 'alert';
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  metadata?: {
    userId?: string;
    reminderType?: string;
    achievementId?: string;
    [key: string]: any;
  };
}

export interface PushNotificationTemplate {
  id: string;
  type: 'morning_reminder' | 'meal_reminder' | 'water_reminder' | 'sleep_reminder' | 'weekly_summary' | 'achievement' | 'motivation';
  titleUz: string;
  titleRu: string;
  messageUz: string;
  messageRu: string;
  emoji: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  defaultTime?: string;
  conditions?: {
    [key: string]: any;
  };
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (chatId: string, args?: string[]) => Promise<void>;
}

class TelegramBotService {
  private static instance: TelegramBotService;
  private botToken: string = '';
  private webhookUrl: string = '';
  private notifications: TelegramNotification[] = [];
  private templates: PushNotificationTemplate[] = [];

  constructor() {
    this.loadTemplates();
  }

  static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService();
    }
    return TelegramBotService.instance;
  }

  // === CONFIGURATION === //

  configure(botToken: string, webhookUrl: string) {
    this.botToken = botToken;
    this.webhookUrl = webhookUrl;
  }

  // === NOTIFICATION TEMPLATES === //

  private loadTemplates() {
    this.templates = [
      {
        id: 'morning_greeting',
        type: 'morning_reminder',
        titleUz: 'Xayrli tong! 🌅',
        titleRu: 'Доброе утро! 🌅',
        messageUz: 'Yangi kun boshlanmoqda! Bugungi maqsadlaringizni amalga oshirishga tayyor misiz? Vaznni o\'lchashni va ertalabki suv ichishni unutmang.',
        messageRu: 'Начинается новый день! Готовы достичь сегодняшних целей? Не забудьте взвеситься и выпить утренний стакан воды.',
        emoji: '🌅',
        frequency: 'daily',
        defaultTime: '07:00'
      },
      {
        id: 'meal_reminder',
        type: 'meal_reminder',
        titleUz: 'Ovqat vaqti! 🍽️',
        titleRu: 'Время еды! 🍽️',
        messageUz: 'Sog\'liq uchun muntazam ovqatlanish muhim. Bugungi ovqatingizni qo\'shishni unutmang!',
        messageRu: 'Регулярное питание важно для здоровья. Не забудьте добавить сегодняшний прием пищи!',
        emoji: '🍽️',
        frequency: 'daily',
        defaultTime: '12:00'
      },
      {
        id: 'water_reminder',
        type: 'water_reminder',
        titleUz: 'Suv ichish vaqti! 💧',
        titleRu: 'Время пить воду! 💧',
        messageUz: 'Tanangiz uchun suv juda muhim. Bugun necha stakan suv ichdingiz?',
        messageRu: 'Вода очень важна для вашего организма. Сколько стаканов воды вы выпили сегодня?',
        emoji: '💧',
        frequency: 'daily',
        defaultTime: '10:00'
      },
      {
        id: 'evening_reflection',
        type: 'sleep_reminder',
        titleUz: 'Kun yakunlanmoqda 🌙',
        titleRu: 'День заканчивается 🌙',
        messageUz: 'Bugungi yutuqlaringizni belgilang va ertaga uchun tayyor bo\'ling. Yaxshi uyqu sog\'lik kaliti!',
        messageRu: 'Отметьте сегодняшние достижения и подготовьтесь к завтрашнему дню. Хороший сон - ключ к здоровью!',
        emoji: '🌙',
        frequency: 'daily',
        defaultTime: '22:00'
      },
      {
        id: 'weekly_summary',
        type: 'weekly_summary',
        titleUz: 'Haftalik hisobot 📊',
        titleRu: 'Недельный отчет 📊',
        messageUz: 'Bu hafta ajoyib ish qildingiz! Taraqqiyotingizni ko\'rib chiqing va yangi hafta uchun maqsad qo\'ying.',
        messageRu: 'Отличная работа на этой неделе! Просмотрите свой прогресс и поставьте цели на новую неделю.',
        emoji: '📊',
        frequency: 'weekly',
        defaultTime: '09:00'
      },
      {
        id: 'achievement_unlock',
        type: 'achievement',
        titleUz: 'Yangi yutuq! 🏆',
        titleRu: 'Новое достижение! 🏆',
        messageUz: 'Tabriklaymiz! Siz yangi yutuqqa erishdingiz. Davom eting!',
        messageRu: 'Поздравляем! Вы получили новое достижение. Продолжайте в том же духе!',
        emoji: '🏆',
        frequency: 'once',
      },
      {
        id: 'motivation_daily',
        type: 'motivation',
        titleUz: 'Motivatsiya 💪',
        titleRu: 'Мотивация 💪',
        messageUz: 'Har bir qadam sizni maqsadingizga yaqinlashtiradi. Bugun ham zo\'r ish qiling!',
        messageRu: 'Каждый шаг приближает вас к цели. Отличной работы и сегодня!',
        emoji: '💪',
        frequency: 'daily',
        defaultTime: '16:00'
      }
    ];
  }

  // === NOTIFICATION SENDING === //

  async sendNotification(
    chatId: string, 
    templateId: string, 
    language: 'uz' | 'ru' = 'uz',
    customData?: any
  ): Promise<boolean> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    const title = language === 'uz' ? template.titleUz : template.titleRu;
    const message = language === 'uz' ? template.messageUz : template.messageRu;
    
    const notification: TelegramNotification = {
      id: `notif_${Date.now()}`,
      chatId,
      message: `${template.emoji} *${title}*\n\n${message}`,
      type: this.getNotificationType(template.type),
      scheduledFor: new Date().toISOString(),
      sent: false,
      metadata: {
        templateId,
        language,
        ...customData
      }
    };

    return await this.sendTelegramMessage(notification);
  }

  async sendCustomNotification(
    chatId: string,
    title: string,
    message: string,
    type: TelegramNotification['type'] = 'reminder'
  ): Promise<boolean> {
    const notification: TelegramNotification = {
      id: `custom_${Date.now()}`,
      chatId,
      message: `*${title}*\n\n${message}`,
      type,
      scheduledFor: new Date().toISOString(),
      sent: false
    };

    return await this.sendTelegramMessage(notification);
  }

  private async sendTelegramMessage(notification: TelegramNotification): Promise<boolean> {
    try {
      if (!this.botToken) {
        console.log('Bot token not configured, simulating notification send');
        console.log('Notification:', notification);
        return true;
      }

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: notification.chatId,
          text: notification.message,
          parse_mode: 'Markdown',
          reply_markup: this.getInlineKeyboard(notification.type)
        }),
      });

      if (response.ok) {
        notification.sent = true;
        notification.sentAt = new Date().toISOString();
        this.notifications.push(notification);
        return true;
      } else {
        console.error('Failed to send notification:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  private getNotificationType(templateType: PushNotificationTemplate['type']): TelegramNotification['type'] {
    switch (templateType) {
      case 'achievement':
        return 'achievement';
      case 'motivation':
        return 'motivation';
      default:
        return 'reminder';
    }
  }

  private getInlineKeyboard(type: TelegramNotification['type']) {
    switch (type) {
      case 'reminder':
        return {
          inline_keyboard: [
            [
              { text: '✅ Bajarildi', callback_data: 'mark_done' },
              { text: '📱 Appni ochish', url: this.webhookUrl }
            ]
          ]
        };
      case 'achievement':
        return {
          inline_keyboard: [
            [
              { text: '🎉 Yutuqlarni ko\'rish', callback_data: 'view_achievements' },
              { text: '📊 Statistika', callback_data: 'view_stats' }
            ]
          ]
        };
      default:
        return {
          inline_keyboard: [
            [
              { text: '📱 Appni ochish', url: this.webhookUrl }
            ]
          ]
        };
    }
  }

  // === SCHEDULED NOTIFICATIONS === //

  async scheduleNotification(
    chatId: string,
    templateId: string,
    scheduleTime: string,
    language: 'uz' | 'ru' = 'uz'
  ): Promise<string> {
    const notification: TelegramNotification = {
      id: `scheduled_${Date.now()}`,
      chatId,
      message: '',
      type: 'reminder',
      scheduledFor: scheduleTime,
      sent: false,
      metadata: {
        templateId,
        language,
        scheduled: true
      }
    };

    // In a real implementation, this would be stored in a database
    // and processed by a background job
    this.notifications.push(notification);
    
    return notification.id;
  }

  async processPendingNotifications(): Promise<void> {
    const now = new Date();
    const pendingNotifications = this.notifications.filter(
      n => !n.sent && new Date(n.scheduledFor) <= now
    );

    for (const notification of pendingNotifications) {
      if (notification.metadata?.templateId) {
        await this.sendNotification(
          notification.chatId,
          notification.metadata.templateId,
          notification.metadata.language as 'uz' | 'ru'
        );
      }
    }
  }

  // === USER INTERACTION RESPONSES === //

  async handleUserResponse(chatId: string, callbackData: string): Promise<void> {
    switch (callbackData) {
      case 'mark_done':
        await this.sendCustomNotification(
          chatId,
          'Ajoyib! 👏',
          'Vazifani bajarganingiz uchun rahmat. Davom eting!',
          'motivation'
        );
        break;
        
      case 'view_achievements':
        await this.sendAchievementsList(chatId);
        break;
        
      case 'view_stats':
        await this.sendWeeklyStats(chatId);
        break;
        
      default:
        console.log(`Unknown callback: ${callbackData}`);
    }
  }

  private async sendAchievementsList(chatId: string): Promise<void> {
    // This would fetch user achievements from the database
    const message = `🏆 *Sizning yutuqlaringiz:*

🔥 7 kunlik seriya
💧 Suv rejimini bajarish
🏃 10,000 qadam
📈 Vazn maqsadiga erishish

Davom eting va yangi yutuqlar qo'lga kiriting!`;

    await this.sendCustomNotification(chatId, '', message, 'achievement');
  }

  private async sendWeeklyStats(chatId: string): Promise<void> {
    // This would fetch user's weekly statistics
    const message = `📊 *Haftalik statistika:*

• O'rtacha qadam: 8,500/kun
• Suv: 6.8/8 stakan/kun  
• Uyqu: 7.2 soat/kechga
• Mashqlar: 4 marta

Bu hafta yaxshi ish qildingiz! 👍`;

    await this.sendCustomNotification(chatId, '', message, 'reminder');
  }

  // === BOT COMMANDS === //

  async setupBotCommands(): Promise<void> {
    const commands = [
      { command: 'start', description: 'Botni ishga tushirish' },
      { command: 'help', description: 'Yordam olish' },
      { command: 'stats', description: 'Statistikani ko\'rish' },
      { command: 'goals', description: 'Maqsadlarni ko\'rish' },
      { command: 'reminder', description: 'Eslatma sozlash' },
      { command: 'settings', description: 'Sozlamalar' }
    ];

    if (!this.botToken) return;

    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commands }),
      });
    } catch (error) {
      console.error('Error setting bot commands:', error);
    }
  }

  // === WEBHOOK HANDLING === //

  async handleWebhook(update: any): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  private async handleMessage(message: any): Promise<void> {
    const chatId = message.chat.id.toString();
    const text = message.text || '';

    if (text.startsWith('/')) {
      await this.handleCommand(chatId, text);
    } else {
      // Handle regular messages
      await this.handleRegularMessage(chatId, text);
    }
  }

  private async handleCommand(chatId: string, command: string): Promise<void> {
    const [cmd, ...args] = command.slice(1).split(' ');

    switch (cmd) {
      case 'start':
        await this.sendCustomNotification(
          chatId,
          'Yurlo AI ga xush kelibsiz! 🎉',
          'Sog\'liq va fitnes yo\'lda hamrohingiz. /help buyrug\'i bilan ko\'proq ma\'lumot oling.',
          'motivation'
        );
        break;

      case 'help':
        await this.sendHelpMessage(chatId);
        break;

      case 'stats':
        await this.sendWeeklyStats(chatId);
        break;

      case 'goals':
        await this.sendGoalsMessage(chatId);
        break;

      default:
        await this.sendCustomNotification(
          chatId,
          'Noma\'lum buyruq',
          'Iltimos, /help buyrug\'i bilan mavjud buyruqlarni ko\'ring.',
          'alert'
        );
    }
  }

  private async handleRegularMessage(chatId: string, text: string): Promise<void> {
    // Simple keyword-based responses
    const lowerText = text.toLowerCase();

    if (lowerText.includes('salom') || lowerText.includes('hello')) {
      await this.sendCustomNotification(
        chatId,
        'Salom! 👋',
        'Bugun qanday yordam bera olaman?',
        'motivation'
      );
    } else if (lowerText.includes('vazn') || lowerText.includes('weight')) {
      await this.sendCustomNotification(
        chatId,
        'Vazn tracking 📊',
        'Appda bugungi vaznni kiritishni unutmang!',
        'reminder'
      );
    } else if (lowerText.includes('suv') || lowerText.includes('water')) {
      await this.sendCustomNotification(
        chatId,
        'Suv ichish 💧',
        'Bugun nechta stakan suv ichdingiz? Appda belgilang!',
        'reminder'
      );
    } else {
      await this.sendCustomNotification(
        chatId,
        'Rahmat! 🙏',
        'Appni ochib, to\'liq funksionallikdan foydalaning!',
        'motivation'
      );
    }
  }

  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const chatId = callbackQuery.message.chat.id.toString();
    const data = callbackQuery.data;

    await this.handleUserResponse(chatId, data);
  }

  private async sendHelpMessage(chatId: string): Promise<void> {
    const message = `🤖 *Yurlo AI Bot yordam*

*Mavjud buyruqlar:*
/start - Botni ishga tushirish
/help - Ushbu yordam xabari
/stats - Haftalik statistika
/goals - Maqsadlaringizni ko'rish

*Qisqa yo'llar:*
• "vazn" - Vazn tracking
• "suv" - Suv tracking  
• "sport" - Mashqlar
• "uyqu" - Uyqu tracking

📱 To'liq imkoniyatlar uchun appni oching!`;

    await this.sendCustomNotification(chatId, '', message, 'reminder');
  }

  private async sendGoalsMessage(chatId: string): Promise<void> {
    const message = `🎯 *Sizning maqsadlaringiz:*

• Kunlik qadam: 10,000
• Suv ichish: 8 stakan
• Uyqu: 8 soat
• Haftalik vazn yo'qotish: 0.5 kg

Maqsadlaringizni o'zgartirish uchun appni oching!`;

    await this.sendCustomNotification(chatId, '', message, 'reminder');
  }

  // === DAILY AUTOMATED REMINDERS === //

  async setupDailyReminders(userId: string, chatId: string, preferences: any): Promise<void> {
    const reminders = [
      { templateId: 'morning_greeting', time: '07:00' },
      { templateId: 'water_reminder', time: '10:00' },
      { templateId: 'meal_reminder', time: '12:00' },
      { templateId: 'motivation_daily', time: '16:00' },
      { templateId: 'evening_reflection', time: '22:00' }
    ];

    for (const reminder of reminders) {
      // In production, this would create cron jobs or database entries
      console.log(`Scheduled ${reminder.templateId} for ${chatId} at ${reminder.time}`);
    }
  }

  // === ANALYTICS AND MONITORING === //

  getNotificationStats(): {
    total: number;
    sent: number;
    pending: number;
    byType: Record<string, number>;
  } {
    const total = this.notifications.length;
    const sent = this.notifications.filter(n => n.sent).length;
    const pending = total - sent;

    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, sent, pending, byType };
  }

  // === UTILITY METHODS === //

  validateChatId(chatId: string): boolean {
    return /^-?\d+$/.test(chatId);
  }

  async testConnection(): Promise<boolean> {
    if (!this.botToken) return false;

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      return response.ok;
    } catch (error) {
      console.error('Bot connection test failed:', error);
      return false;
    }
  }
}

export default TelegramBotService;