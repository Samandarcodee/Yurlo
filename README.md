# 🥗 Caloria AI - Telegram Mini App

> **✅ PRODUCTION READY** - Telegram'dagi aqlli sog'liq kuzatuv yordamchingiz

[![Live Demo](https://img.shields.io/badge/Live%20Demo-yurlo.vercel.app-blue?style=for-the-badge)](https://yurlo.vercel.app)
[![Telegram Bot](https://img.shields.io/badge/Telegram-@Yurlo__bot-blue?style=for-the-badge&logo=telegram)](https://t.me/Yurlo_bot)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-blue?style=for-the-badge&logo=react)](https://reactjs.org)

AI yordamida ovqat kaloriyalarini hisoblash, shaxsiy tavsiyalar va sog'liq kuzatuvi.

## 🚀 **Hoziroq Foydalaning!**

### **📱 Telegram'da Test Qiling:**

1. [@Yurlo_bot](https://t.me/Yurlo_bot) ga boring
2. `/start` buyrug'ini yuboring
3. `🥗 Caloria AI` tugmasini bosing
4. Mini App ochiladi va foydalaning!

### **🌐 Bevosita Link:**

[https://yurlo.vercel.app](https://yurlo.vercel.app)

---

## ✨ Xususiyatlar

- **AI Ovqat Tahlili**: Rasm yoki matn orqali ovqat kaloriyalarini aniqlash
- **Shaxsiy Profil**: Yosh, vazn, bo'y va maqsadlarga asoslangan BMR hisoblash
- **AI Tavsiyalar**: Shaxsiy sog'liq tavsiyalari va maqsadlarga erishish yo'llari
- **Suv Kuzatuvi**: Kunlik suv iste'molini nazorat qilish
- **Faollik Kuzatuvi**: Jismoniy mashqlar va faollikni qayd etish
- **Analitika**: Progress tracking va vizualizatsiya
- **Ko'p Tillilik**: O'zbek, Rus va Ingliz tillari

## 📱 Telegram Mini App Sifatida Ishga Tushirish

### 1. Loyihani Deploy Qilish

```bash
# Dependencies'larni o'rnatish
npm install

# Build qilish
npm run build

# Test qilish (ixtiyoriy)
npm run dev
```

### 2. Telegram Bot Yaratish

1. [@BotFather](https://t.me/BotFather) ga murojaat qiling
2. `/newbot` buyrug'ini yuboring
3. Bot nomi va username'ini kiriting (masalan: `@caloria_ai_bot`)
4. Bot token'ini saqlang

### 3. Telegram Mini App Sozlash

1. BotFather'da `/mybots` ni bosing
2. O'z botingizni tanlang
3. "Bot Settings" > "Menu Button" > "Configure Menu Button"
4. Deploy qilingan URL'ni kiriting (masalan: `https://caloria-ai.netlify.app`)
5. Button matnini kiriting: "Caloria AI ochish"

### 4. Netlify Deploy (Tavsiya etiladi)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/caloria-ai)

Yoki qo'lda:

1. Netlify'ga kirish: https://netlify.com
2. "Add new site" > "Import an existing project"
3. GitHub repo'ni ulash
4. Build buyruq: `npm run build:client`
5. Publish directory: `dist/spa`
6. Deploy qilish

### 5. Telegram Mini App Test Qilish

1. Telegram'da o'z botingizga `/start` yuboring
2. Menu buttonni bosing yoki `/menu` buyrug'ini yuboring
3. Mini App ochilishini kutting

## 🛠 Development

```bash
# Development server ishga tushirish
npm run dev

# Build qilish
npm run build

# Type checking
npm run typecheck

# Tests ishga tushirish
npm test
```

## 📂 Loyiha Strukturasi

```
caloria-ai/
├── client/              # Frontend (React + TypeScript)
│   ├── components/      # UI komponenlari
│   ├── pages/          # Sahifalar
│   ├── hooks/          # Custom hooks (Telegram WebApp)
│   ├── contexts/       # React Context (User, Telegram)
│   └── types/          # TypeScript type definitions
├── server/             # Backend API (Express.js)
├── netlify/           # Netlify Functions
└── public/            # Static files
```

## 🔧 Telegram WebApp API

Loyiha quyidagi Telegram WebApp API'larini ishlatadi:

- `window.Telegram.WebApp.initDataUnsafe.user` - Foydalanuvchi ma'lumotlari
- `window.Telegram.WebApp.ready()` - Mini App tayyorligini bildirish
- `window.Telegram.WebApp.expand()` - To'liq ekran rejimi
- `window.Telegram.WebApp.HapticFeedback` - Vibration feedback
- `window.Telegram.WebApp.MainButton` - Asosiy tugma
- `window.Telegram.WebApp.BackButton` - Orqaga tugma

## 🌐 Browser Test Qilish

Development jarayonida oddiy browserda ham test qilish mumkin:

```bash
npm run dev
# http://localhost:8080 da ochish
```

## 📦 Deploy Qilish

### Netlify (Tavsiya etiladi)

```bash
npm run build:client
# dist/spa papkasini Netlify'ga yuklash
```

### Vercel

```bash
npm run build:client
vercel --prod
```

### GitHub Pages

```bash
npm run build:client
# dist/spa papkasini gh-pages branch'iga yuklash
```

## ⚡ Performance Optimizatsiya

- React 18 Concurrent Features
- Code splitting va lazy loading
- Image optimization
- Service Worker (keyingi versiyada)
- Telegram WebApp SDK optimization

## 🔒 Xavfsizlik

- Telegram WebApp init data validation
- CORS sozlash
- Content Security Policy
- XSS himoyasi

## 📱 Platform Qo'llab-quvvatlash

- iOS Safari (Telegram)
- Android Chrome (Telegram)
- Desktop Telegram Web

## 🎨 UI/UX Xususiyatlari

- Glassmorphism design
- Dark/Light theme (Telegram theme'ga mos)
- Haptic feedback
- Smooth animations
- Mobile-first responsive design

## 🔄 Ma'lumotlar Saqlash

- LocalStorage (offline work)
- Telegram user ID asosida
- Backend API integration
- Real-time sinxronizatsiya

## 📞 Yordam

Muammolar yoki savollar uchun:

- GitHub Issues ochish
- Telegram: [@your_telegram]
- Email: your-email@example.com

## 📄 Litsenziya

MIT License - batafsil ma'lumot `LICENSE` faylida.
