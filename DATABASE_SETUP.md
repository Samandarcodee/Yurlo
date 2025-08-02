# 🗄️ DATABASE SETUP GUIDE

## Supabase Integration for Yurlo AI

---

## 📋 **QADAMLAR**

### **1. Supabase Project Yaratish**

1. [supabase.com](https://supabase.com) ga boring
2. "New Project" tugmasini bosing
3. Project nomini kiriting: `yurlo-ai`
4. Database password yarating
5. Region tanlang (Yevropa uchun `West Europe`)
6. "Create new project" tugmasini bosing

### **2. Database Schema O'rnatish**

1. Supabase Dashboard'ga kiring
2. "SQL Editor" bo'limiga boring
3. `database-schema.sql` faylini copy qiling
4. SQL Editor'da paste qiling va "Run" tugmasini bosing

### **3. Environment Variables O'rnatish**

1. Supabase Project Settings'ga boring
2. "API" bo'limini toping
3. Quyidagi ma'lumotlarni nusxalang:

```env
# .env.local faylida
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **4. Row Level Security (RLS) Sozlash**

Database schema'da RLS allaqachon sozlangan. Faqat Authentication sozlamalarini tekshiring:

1. Supabase Dashboard → Authentication → Settings
2. "Enable email confirmations" ni o'chirib qo'ying
3. "Enable phone confirmations" ni o'chirib qo'ying

---

## 🔧 **DATABASE TABLES**

### **user_profiles**
- Foydalanuvchi asosiy ma'lumotlari
- Telegram ID asosida identifikatsiya
- BMR va kaloriya hisoblar

### **sleep_sessions**
- Uyqu ma'lumotlari
- Sifat va davomiylik
- Kunlik bir session

### **step_sessions**
- Qadamlar ma'lumotlari
- Masofa va kaloriya hisoblar
- Kunlik bir session

### **meal_entries**
- Ovqat ma'lumotlari
- Kaloriya va makronutrientlar
- Kunlik ko'p entry

### **water_intake**
- Suv ichish ma'lumotlari
- Kunlik ko'p entry

### **workout_sessions**
- Mashg'ulot ma'lumotlari
- Kaloriya yoqish hisoblar

### **user_goals**
- Foydalanuvchi maqsadlari
- Kunlik va haftalik maqsadlar

---

## 🛡️ **SECURITY**

### **Row Level Security (RLS)**
- Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi
- Telegram ID asosida identifikatsiya
- Barcha jadvallar RLS bilan himoyalangan

### **Data Validation**
- Ma'lumotlar kiritishda validatsiya
- SQL CHECK constraints
- Type safety TypeScript bilan

---

## 📊 **PERFORMANCE**

### **Indexes**
- Telegram ID uchun index
- Date va user_id uchun composite indexes
- Query performance optimizatsiya

### **Functions**
- `get_user_daily_stats()` - kunlik statistika
- `update_updated_at_column()` - timestamp yangilash

---

## 🔄 **MIGRATION FROM LOCALSTORAGE**

### **Automatic Migration**
- Database mavjud bo'lsa database'dan o'qiladi
- Database yo'q bo'lsa localStorage'dan o'qiladi (fallback)
- Ma'lumotlar avtomatik migratsiya qilinadi

### **Data Sync**
- Database va localStorage o'rtasida sync
- Offline support saqlanadi
- Error handling bilan

---

## 🧪 **TESTING**

### **Database Connection Test**
```typescript
// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
};
```

### **Data Migration Test**
```typescript
// Test data migration from localStorage
const testMigration = async (telegramId: string) => {
  const storageKey = `userProfile_${telegramId}`;
  const savedProfile = localStorage.getItem(storageKey);
  
  if (savedProfile) {
    const profileData = JSON.parse(savedProfile);
    const migrated = await databaseService.createUserProfile({
      telegram_id: telegramId,
      name: profileData.name,
      // ... other fields
    });
    
    if (migrated) {
      localStorage.removeItem(storageKey);
      console.log('Data migrated successfully');
    }
  }
};
```

---

## 🚀 **DEPLOYMENT**

### **Vercel Environment Variables**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Quyidagi o'zgaruvchilarni qo'shing:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Production Database**
1. Supabase Project → Settings → Database
2. Connection string'ni nusxalang
3. Vercel'da environment variable sifatida saqlang

---

## 📈 **MONITORING**

### **Supabase Dashboard**
- Real-time database monitoring
- Query performance analytics
- Error tracking

### **Application Logs**
- Database connection logs
- Query execution logs
- Error handling logs

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

1. **Connection Error**
   - Environment variables to'g'ri o'rnatilganini tekshiring
   - Supabase project faol ekanligini tekshiring

2. **RLS Policy Error**
   - Authentication sozlamalarini tekshiring
   - Telegram ID formatini tekshiring

3. **Data Migration Error**
   - localStorage data formatini tekshiring
   - Database schema'ni tekshiring

### **Debug Commands**
```bash
# Database connection test
npm run test:db

# Data migration test
npm run test:migration

# Schema validation
npm run test:schema
```

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Supabase project yaratildi
- [ ] Database schema o'rnatildi
- [ ] Environment variables sozlandi
- [ ] RLS policies faol
- [ ] Application database bilan ishlaydi
- [ ] Data migration test o'tdi
- [ ] Production deployment tayyor

---

## 🎯 **NEXT STEPS**

1. **Supabase project yarating**
2. **Database schema'ni o'rnating**
3. **Environment variables'ni sozlang**
4. **Application'ni test qiling**
5. **Production'ga deploy qiling**

Database integration to'liq tayyor! 🚀 