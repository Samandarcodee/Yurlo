/**
 * Comprehensive Profile Page - Full Functionality
 * Complete user profile management with all features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit3, Save, X, Camera, Settings, Bell, Shield, 
  Activity, Target, Zap, Calendar, Clock, Smartphone,
  Download, Upload, Trash2, Award, TrendingUp, Heart,
  Ruler, Weight, Globe, Languages, Moon, Sun, Volume2,
  Share2, Lock, Eye, EyeOff, RotateCcw, CheckCircle,
  AlertCircle, Info, HelpCircle, LogOut, RefreshCw,
  ChevronRight, ChevronDown, Plus, Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';

interface PersonalInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: string;
  language: string;
  timezone: string;
}

interface PhysicalData {
  height: string;
  weight: string;
  bodyFat?: string;
  muscleMass?: string;
  targetWeight: string;
}

interface Goals {
  primary: 'lose' | 'maintain' | 'gain';
  weeklyWeightChange: number;
  dailyCalories: number;
  dailySteps: number;
  waterIntake: number;
  sleepHours: number;
}

interface ActivitySettings {
  level: 'low' | 'medium' | 'high';
  workoutDays: string[];
  preferredWorkoutTime: string;
  workoutDuration: number;
}

interface NotificationSettings {
  mealReminders: boolean;
  waterReminders: boolean;
  workoutReminders: boolean;
  bedtimeReminders: boolean;
  achievementNotifications: boolean;
  weeklyReports: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  target?: number;
}

export default function ComprehensiveProfile() {
  const { user, updateUser } = useUser();
  const { user: telegramUser, hapticFeedback, showAlert, showConfirm } = useTelegram();

  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.name || '',
    gender: (user?.gender as 'male' | 'female') || 'male',
    birthYear: user?.birthYear || '1990',
    language: user?.language || 'uz',
    timezone: 'Asia/Tashkent'
  });

  const [physicalData, setPhysicalData] = useState<PhysicalData>({
    height: user?.height || '',
    weight: user?.weight || '',
    bodyFat: '',
    muscleMass: '',
    targetWeight: ''
  });

  const [goals, setGoals] = useState<Goals>({
    primary: (user?.goal as 'lose' | 'maintain' | 'gain') || 'maintain',
    weeklyWeightChange: 0.5,
    dailyCalories: user?.dailyCalories || 2000,
    dailySteps: 10000,
    waterIntake: 8,
    sleepHours: 8
  });

  const [activitySettings, setActivitySettings] = useState<ActivitySettings>({
    level: (user?.activityLevel as 'low' | 'medium' | 'high') || 'medium',
    workoutDays: ['monday', 'wednesday', 'friday'],
    preferredWorkoutTime: '18:00',
    workoutDuration: 60
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    mealReminders: true,
    waterReminders: true,
    workoutReminders: true,
    bedtimeReminders: true,
    achievementNotifications: true,
    weeklyReports: true,
    soundEnabled: true,
    vibrationEnabled: true
  });

  // Mock achievements data
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Birinchi qadam',
      description: 'Birinchi marta ro\'yxatdan o\'tdingiz',
      icon: '🎉',
      earnedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: '7 kunlik seri',
      description: '7 kun ketma-ket logging',
      icon: '🔥',
      progress: 5,
      target: 7
    },
    {
      id: '3',
      title: 'Suv chempioni',
      description: '10 kun ketma-ket suv maqsadiga erishish',
      icon: '💧',
      progress: 3,
      target: 10
    },
    {
      id: '4',
      title: 'Step Master',
      description: '50,000 qadam yurish',
      icon: '👟',
      progress: 35000,
      target: 50000
    }
  ]);

  const sections = [
    { id: 'personal', title: 'Shaxsiy ma\'lumotlar', icon: User },
    { id: 'physical', title: 'Jismoniy ma\'lumotlar', icon: Activity },
    { id: 'goals', title: 'Maqsadlar', icon: Target },
    { id: 'activity', title: 'Faollik sozlamalari', icon: Zap },
    { id: 'notifications', title: 'Bildirishnomalar', icon: Bell },
    { id: 'achievements', title: 'Yutuqlar', icon: Award },
    { id: 'settings', title: 'Umumiy sozlamalar', icon: Settings }
  ];

  const handleSave = async () => {
    setLoading(true);
    hapticFeedback.impact('light');

    try {
      // Calculate new BMR and daily calories based on updated data
      const age = new Date().getFullYear() - parseInt(personalInfo.birthYear);
      const heightNum = parseFloat(physicalData.height);
      const weightNum = parseFloat(physicalData.weight);

      let bmr = 0;
      if (personalInfo.gender === 'male') {
        bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
      }

      const activityMultiplier = {
        low: 1.2,
        medium: 1.55,
        high: 1.725,
      };

      const calculatedCalories = Math.round(bmr * activityMultiplier[activitySettings.level]);

      const updatedUser = {
        ...user,
        ...personalInfo,
        height: physicalData.height,
        weight: physicalData.weight,
        goal: goals.primary,
        activityLevel: activitySettings.level,
        sleepTime: user?.sleepTime || '22:00',
        wakeTime: user?.wakeTime || '07:00',
        age,
        bmr: Math.round(bmr),
        dailyCalories: goals.dailyCalories || calculatedCalories,
        isFirstTime: false,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedUser);
      setIsEditing(false);
      hapticFeedback.notification('success');
      showAlert('Ma\'lumotlar muvaffaqiyatli saqlandi!');

    } catch (error) {
      console.error('Error saving profile:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await showConfirm('Barcha o\'zgarishlarni bekor qilasizmi?');
    if (confirmed) {
      // Reset to original user data
      setPersonalInfo({
        name: user?.name || '',
        gender: (user?.gender as 'male' | 'female') || 'male',
        birthYear: user?.birthYear || '1990',
        language: user?.language || 'uz',
        timezone: 'Asia/Tashkent'
      });
      setPhysicalData({
        height: user?.height || '',
        weight: user?.weight || '',
        bodyFat: '',
        muscleMass: '',
        targetWeight: ''
      });
      setIsEditing(false);
      hapticFeedback.impact('light');
    }
  };

  const exportData = () => {
    const exportData = {
      personalInfo,
      physicalData,
      goals,
      activitySettings,
      notifications,
      achievements: achievements.filter(a => a.earnedAt),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yurlo-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    hapticFeedback.notification('success');
    showAlert('Ma\'lumotlar yuklab olindi!');
  };

  const renderPersonalSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Shaxsiy ma'lumotlar</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-300 hover:text-white"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-white">Ism</Label>
          <Input
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
            disabled={!isEditing}
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label className="text-white">Jins</Label>
          <RadioGroup
            value={personalInfo.gender}
            onValueChange={(value) => setPersonalInfo({...personalInfo, gender: value as 'male' | 'female'})}
            disabled={!isEditing}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" disabled={!isEditing} />
              <Label htmlFor="male" className="text-white">Erkak</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" disabled={!isEditing} />
              <Label htmlFor="female" className="text-white">Ayol</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">Tug'ilgan yil</Label>
          <Input
            type="number"
            value={personalInfo.birthYear}
            onChange={(e) => setPersonalInfo({...personalInfo, birthYear: e.target.value})}
            disabled={!isEditing}
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label className="text-white">Til</Label>
          <RadioGroup
            value={personalInfo.language}
            onValueChange={(value) => setPersonalInfo({...personalInfo, language: value})}
            disabled={!isEditing}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="uz" id="uz" disabled={!isEditing} />
              <Label htmlFor="uz" className="text-white">O'zbek</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ru" id="ru" disabled={!isEditing} />
              <Label htmlFor="ru" className="text-white">Русский</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" disabled={!isEditing} />
              <Label htmlFor="en" className="text-white">English</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-3">
          <Button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Saqlash
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Bekor qilish
          </Button>
        </div>
      )}
    </div>
  );

  const renderPhysicalSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Jismoniy ma'lumotlar</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-300 hover:text-white"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Bo'y (sm)</Label>
          <Input
            type="number"
            value={physicalData.height}
            onChange={(e) => setPhysicalData({...physicalData, height: e.target.value})}
            disabled={!isEditing}
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label className="text-white">Vazn (kg)</Label>
          <Input
            type="number"
            value={physicalData.weight}
            onChange={(e) => setPhysicalData({...physicalData, weight: e.target.value})}
            disabled={!isEditing}
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label className="text-white">Maqsadli vazn (kg)</Label>
          <Input
            type="number"
            value={physicalData.targetWeight}
            onChange={(e) => setPhysicalData({...physicalData, targetWeight: e.target.value})}
            disabled={!isEditing}
            placeholder="Ixtiyoriy"
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label className="text-white">Yog' foizi (%)</Label>
          <Input
            type="number"
            value={physicalData.bodyFat}
            onChange={(e) => setPhysicalData({...physicalData, bodyFat: e.target.value})}
            disabled={!isEditing}
            placeholder="Ixtiyoriy"
            className="mt-2 bg-slate-800 border-slate-600 text-white disabled:opacity-60"
          />
        </div>
      </div>

      {/* BMI Calculator */}
      {physicalData.height && physicalData.weight && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">BMI Kalkulyatori</h4>
          {(() => {
            const height = parseFloat(physicalData.height) / 100;
            const weight = parseFloat(physicalData.weight);
            const bmi = weight / (height * height);
            const getBMICategory = (bmi: number) => {
              if (bmi < 18.5) return { text: 'Kam vazn', color: 'text-blue-400' };
              if (bmi < 25) return { text: 'Normal', color: 'text-green-400' };
              if (bmi < 30) return { text: 'Ortiqcha vazn', color: 'text-yellow-400' };
              return { text: 'Semizlik', color: 'text-red-400' };
            };
            const category = getBMICategory(bmi);
            return (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">BMI: {bmi.toFixed(1)}</span>
                <span className={category.color}>{category.text}</span>
              </div>
            );
          })()}
        </div>
      )}

      {isEditing && (
        <div className="flex space-x-3">
          <Button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Saqlash
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Bekor qilish
          </Button>
        </div>
      )}
    </div>
  );

  const renderGoalsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Maqsadlar va limitlar</h3>

      <div className="space-y-4">
        <div>
          <Label className="text-white">Asosiy maqsad</Label>
          <RadioGroup
            value={goals.primary}
            onValueChange={(value) => setGoals({...goals, primary: value as 'lose' | 'maintain' | 'gain'})}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lose" id="lose" />
              <Label htmlFor="lose" className="text-white">Vazn kamaytirish</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maintain" id="maintain" />
              <Label htmlFor="maintain" className="text-white">Vaznni saqlash</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gain" id="gain" />
              <Label htmlFor="gain" className="text-white">Vazn oshirish</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-white">Kunlik kaloriya maqsadi: {goals.dailyCalories} kcal</Label>
          <Slider
            value={[goals.dailyCalories]}
            onValueChange={(value) => setGoals({...goals, dailyCalories: value[0]})}
            max={3500}
            min={1200}
            step={50}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-white">Kunlik qadam maqsadi: {goals.dailySteps.toLocaleString()}</Label>
          <Slider
            value={[goals.dailySteps]}
            onValueChange={(value) => setGoals({...goals, dailySteps: value[0]})}
            max={20000}
            min={5000}
            step={500}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-white">Kunlik suv: {goals.waterIntake} stakan</Label>
          <Slider
            value={[goals.waterIntake]}
            onValueChange={(value) => setGoals({...goals, waterIntake: value[0]})}
            max={16}
            min={4}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-white">Uyqu davomiyligi: {goals.sleepHours} soat</Label>
          <Slider
            value={[goals.sleepHours]}
            onValueChange={(value) => setGoals({...goals, sleepHours: value[0]})}
            max={12}
            min={5}
            step={0.5}
            className="mt-2"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Maqsadlarni saqlash
      </Button>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Bildirishnoma sozlamalari</h3>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => {
          const labels: Record<string, string> = {
            mealReminders: 'Ovqat eslatmalari',
            waterReminders: 'Suv eslatmalari',
            workoutReminders: 'Mashq eslatmalari',
            bedtimeReminders: 'Uyqu vaqti eslatmalari',
            achievementNotifications: 'Yutuq bildirishnomalari',
            weeklyReports: 'Haftalik hisobotlar',
            soundEnabled: 'Ovoz yoqilgan',
            vibrationEnabled: 'Tebranish yoqilgan'
          };

          return (
            <div key={key} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
              <span className="text-white">{labels[key]}</span>
              <Switch
                checked={value}
                onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
              />
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
        <Save className="w-4 h-4 mr-2" />
        Sozlamalarni saqlash
      </Button>
    </div>
  );

  const renderAchievementsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Yutuqlar</h3>

      <div className="grid grid-cols-1 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-slate-700/50 rounded-lg p-4 border-l-4 ${
              achievement.earnedAt ? 'border-green-400' : 'border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className={`font-medium ${achievement.earnedAt ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-slate-300">{achievement.description}</p>
                  {achievement.earnedAt && (
                    <p className="text-xs text-green-400 mt-1">
                      Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {achievement.earnedAt ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
              )}
            </div>
            
            {achievement.progress !== undefined && achievement.target && (
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="text-slate-300">
                    {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Umumiy sozlamalar</h3>

      <div className="space-y-4">
        <Button onClick={exportData} variant="outline" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Ma'lumotlarni eksport qilish
        </Button>

        <Button variant="outline" className="w-full justify-start text-yellow-400 border-yellow-400">
          <RefreshCw className="w-4 h-4 mr-2" />
          Ma'lumotlarni sinxronlash
        </Button>

        <Separator className="bg-slate-600" />

        <Button variant="outline" className="w-full justify-start text-red-400 border-red-400">
          <Trash2 className="w-4 h-4 mr-2" />
          Barcha ma'lumotlarni o'chirish
        </Button>

        <Button variant="outline" className="w-full justify-start text-red-400 border-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Akkauntdan chiqish
        </Button>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Ma'lumotlar</h4>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Yaratilgan:</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Noma\'lum'}</span>
          </div>
          <div className="flex justify-between">
            <span>Oxirgi yangilanish:</span>
            <span>{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Hech qachon'}</span>
          </div>
          <div className="flex justify-between">
            <span>Telegram ID:</span>
            <span>{user?.telegramId || 'Bog\'lanmagan'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'physical':
        return renderPhysicalSection();
      case 'goals':
        return renderGoalsSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'achievements':
        return renderAchievementsSection();
      case 'settings':
        return renderSettingsSection();
      default:
        return renderPersonalSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 pb-20">
        {/* Header */}
        <div className="pt-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            Profil
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300"
          >
            To'liq sozlamalar va ma'lumotlar
          </motion.p>
        </div>

        {/* Section Navigation */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveSection(section.id);
                    hapticFeedback.impact('light');
                  }}
                  className={`justify-start text-xs h-auto py-2 ${
                    activeSection === section.id
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {section.title}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Active Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
            <CardContent className="p-6">
              {renderActiveSection()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}