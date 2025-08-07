import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

export type Language = "uz" | "ru" | "en";

type Dictionary = Record<string, string> | Record<string, any>;

const dictionaries: Record<Language, Dictionary> = {
  uz: {
    general: {
      back: "Orqaga",
      next: "Keyingi",
      save: "Saqlash",
      finish: "Tugallash",
      loading: "Yuklanmoqda...",
      language: "Til",
    },
    onboarding: {
      title: "Caloria AI'ga Xush Kelibsiz!",
      step: "Qadam",
      personalInfo: "Asosiy Ma'lumotlar",
      gender: "Jinsingiz",
      male: "Erkak",
      female: "Ayol",
      birthYear: "Tug'ilgan yil",
      physical: "Jismoniy O'lchamlar",
      height: "Bo'yingiz (sm)",
      weight: "Vazningiz (kg)",
      goals: "Maqsad va Faollik",
      activity: "Faollik darajangiz",
      goal: "Maqsadingiz",
      low: "Kam faol",
      medium: "O'rtacha faol",
      high: "Juda faol",
      lose: "Vazn kamaytirish",
      maintain: "Vaznni saqlash",
      gain: "Vazn ko'paytirish",
      sleepTime: "Uxlash vaqti (ixtiyoriy)",
      wakeTime: "Uyg'onish vaqti (ixtiyoriy)",
      complete: "Tugallash",
    },
    profile: {
      profileInfo: "Profil Ma'lumotlari",
      edit: "Tahrirlash",
      cancel: "Bekor qilish",
      name: "Ism",
      gender: "Jins",
      age: "Yosh",
      height: "Bo'y",
      weight: "Vazn",
      activity: "Faollik",
      goal: "Maqsad",
      settings: "Sozlamalar",
    },
  },
  ru: {
    general: {
      back: "Назад",
      next: "Далее",
      save: "Сохранить",
      finish: "Завершить",
      loading: "Загрузка...",
      language: "Язык",
    },
    onboarding: {
      title: "Добро пожаловать в Caloria AI!",
      step: "Шаг",
      personalInfo: "Основные данные",
      gender: "Ваш пол",
      male: "Мужчина",
      female: "Женщина",
      birthYear: "Год рождения",
      physical: "Физические параметры",
      height: "Рост (см)",
      weight: "Вес (кг)",
      goals: "Цели и активность",
      activity: "Уровень активности",
      goal: "Ваша цель",
      low: "Малоподвижный",
      medium: "Средняя активность",
      high: "Высокая активность",
      lose: "Похудение",
      maintain: "Поддержание веса",
      gain: "Набор веса",
      sleepTime: "Время сна (необязательно)",
      wakeTime: "Время подъема (необязательно)",
      complete: "Завершение",
    },
    profile: {
      profileInfo: "Данные профиля",
      edit: "Редактировать",
      cancel: "Отмена",
      name: "Имя",
      gender: "Пол",
      age: "Возраст",
      height: "Рост",
      weight: "Вес",
      activity: "Активность",
      goal: "Цель",
      settings: "Настройки",
    },
  },
  en: {
    general: {
      back: "Back",
      next: "Next",
      save: "Save",
      finish: "Finish",
      loading: "Loading...",
      language: "Language",
    },
    onboarding: {
      title: "Welcome to Caloria AI!",
      step: "Step",
      personalInfo: "Personal Information",
      gender: "Your gender",
      male: "Male",
      female: "Female",
      birthYear: "Birth year",
      physical: "Physical Measurements",
      height: "Height (cm)",
      weight: "Weight (kg)",
      goals: "Goals & Activity",
      activity: "Activity level",
      goal: "Your goal",
      low: "Sedentary",
      medium: "Moderate",
      high: "High",
      lose: "Lose weight",
      maintain: "Maintain weight",
      gain: "Gain weight",
      sleepTime: "Bedtime (optional)",
      wakeTime: "Wake time (optional)",
      complete: "Complete",
    },
    profile: {
      profileInfo: "Profile Information",
      edit: "Edit",
      cancel: "Cancel",
      name: "Name",
      gender: "Gender",
      age: "Age",
      height: "Height",
      weight: "Weight",
      activity: "Activity",
      goal: "Goal",
      settings: "Settings",
    },
  },
};

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language") as Language | null;
    return saved || "uz";
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = useMemo(() => {
    const get = (path: string) => {
      const parts = path.split(".");
      let cur: any = dictionaries[language];
      for (const p of parts) {
        cur = cur?.[p];
      }
      return typeof cur === "string" ? cur : path;
    };
    return get;
  }, [language]);

  const value: I18nContextValue = { language, setLanguage, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

