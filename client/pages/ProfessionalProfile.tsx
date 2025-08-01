/**
 * Professional Profile Page - Complete Settings & Management
 * Advanced user profile with comprehensive settings and data management
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
  ChevronRight, ChevronDown, Plus, Minus, Star,
  Database, FileText, Link as LinkIcon, QrCode,
  Palette, Monitor, Wifi, WifiOff, Bluetooth,
  MapPin, Navigation, Clock3, Timer
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';
import { useTheme } from '@/contexts/ThemeContext';

// Advanced Profile Interfaces
interface UserProfile {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  avatar?: string;
  bio?: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  language: 'uz' | 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
}

interface PhysicalData {
  height: number;
  weight: number;
  targetWeight?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  medicalConditions?: string[];
  allergies?: string[];
}

interface HealthGoals {
  primaryGoal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_health';
  weeklyWeightChange: number;
  dailyCalories: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  waterIntake: number;
  sleepHours: number;
  dailySteps: number;
  workoutDays: number;
}

interface NotificationSettings {
  enabled: boolean;
  mealReminders: boolean;
  waterReminders: boolean;
  workoutReminders: boolean;
  sleepReminders: boolean;
  weightTracking: boolean;
  progressUpdates: boolean;
  achievements: boolean;
  socialUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareProgress: boolean;
  shareAchievements: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  dataSharing: {
    analytics: boolean;
    research: boolean;
    marketing: boolean;
  };
  twoFactorAuth: boolean;
}

interface AppSettings {
  language: 'uz' | 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    distance: 'km' | 'miles';
    temperature: 'celsius' | 'fahrenheit';
  };
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: 'UZS' | 'USD' | 'EUR' | 'RUB';
  autoSync: boolean;
  offlineMode: boolean;
  dataUsage: 'high' | 'medium' | 'low';
}

export default function ProfessionalProfile() {
  const { user, updateUser } = useUser();
  const { user: telegramUser, hapticFeedback, showAlert, showConfirm } = useTelegram();
  const { theme, setTheme } = useTheme();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Profile data states
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.telegramId || '1',
    telegramId: user?.telegramId || '',
    name: user?.name || '',
    gender: (user?.gender as 'male' | 'female') || 'male',
    birthDate: user?.birthYear ? `${user.birthYear}-01-01` : '1990-01-01',
    language: (user?.language as 'uz' | 'ru' | 'en') || 'uz',
    theme: 'system'
  });

  const [physicalData, setPhysicalData] = useState<PhysicalData>({
    height: parseFloat(user?.height || '170'),
    weight: parseFloat(user?.weight || '70'),
    bmi: 0,
    activityLevel: (user?.activityLevel as any) || 'moderately_active'
  });

  const [healthGoals, setHealthGoals] = useState<HealthGoals>({
    primaryGoal: (user?.goal as any) || 'maintain_weight',
    weeklyWeightChange: 0.5,
    dailyCalories: user?.dailyCalories || 2000,
    macroTargets: { protein: 30, carbs: 40, fat: 30 },
    waterIntake: 8,
    sleepHours: 8,
    dailySteps: 10000,
    workoutDays: 3
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    enabled: true,
    mealReminders: true,
    waterReminders: true,
    workoutReminders: true,
    sleepReminders: true,
    weightTracking: false,
    progressUpdates: true,
    achievements: true,
    socialUpdates: false,
    emailNotifications: false,
    pushNotifications: true,
    sound: true,
    vibration: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareProgress: false,
    shareAchievements: false,
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataSharing: {
      analytics: false,
      research: false,
      marketing: false
    },
    twoFactorAuth: false
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: (user?.language as 'uz' | 'ru' | 'en') || 'uz',
    theme: 'system',
    units: {
      weight: 'kg',
      height: 'cm',
      distance: 'km',
      temperature: 'celsius'
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'UZS',
    autoSync: true,
    offlineMode: false,
    dataUsage: 'medium'
  });

  // Calculate BMI when height/weight changes
  useEffect(() => {
    const bmi = physicalData.weight / Math.pow(physicalData.height / 100, 2);
    setPhysicalData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
  }, [physicalData.height, physicalData.weight]);

  const tabs = [
    { id: 'overview', title: 'Umumiy', icon: User },
    { id: 'personal', title: 'Shaxsiy', icon: Edit3 },
    { id: 'health', title: 'Salomatlik', icon: Heart },
    { id: 'goals', title: 'Maqsadlar', icon: Target },
    { id: 'notifications', title: 'Bildirishnomalar', icon: Bell },
    { id: 'privacy', title: 'Maxfiylik', icon: Shield },
    { id: 'settings', title: 'Sozlamalar', icon: Settings },
    { id: 'data', title: 'Ma\'lumotlar', icon: Database }
  ];

  const saveProfile = async () => {
    setLoading(true);
    hapticFeedback.impact('light');

    try {
      const updatedUserData = {
        ...user,
        name: profile.name,
        gender: profile.gender,
        language: profile.language,
        height: physicalData.height.toString(),
        weight: physicalData.weight.toString(),
        activityLevel: physicalData.activityLevel,
        goal: healthGoals.primaryGoal,
        dailyCalories: healthGoals.dailyCalories,
        updatedAt: new Date().toISOString()
      };

      updateUser(updatedUserData);
      setIsEditing(null);
      hapticFeedback.notification('success');
      showAlert('Ma\'lumotlar muvaffaqiyatli saqlandi!');
    } catch (error) {
      console.error('Error saving profile:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const exportData = {
      profile,
      physicalData,
      healthGoals,
      notifications,
      privacy,
      appSettings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yurlo-profile-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    hapticFeedback.notification('success');
    showAlert('Ma\'lumotlar eksport qilindi!');
  };

  const deleteAccount = async () => {
    const confirmed = await showConfirm(
      'Hisobingizni o\'chirishni xohlaysizmi? Bu amal qaytarib bo\'lmaydi!'
    );
    
    if (confirmed) {
      try {
        // Here you would call your delete account API
        hapticFeedback.notification('success');
        showAlert('Hisob o\'chirildi');
        // Redirect to login or home
      } catch (error) {
        hapticFeedback.notification('error');
        showAlert('Xatolik yuz berdi');
      }
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Kam vazn', color: 'text-blue-400' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { text: 'Ortiqcha vazn', color: 'text-yellow-400' };
    return { text: 'Semizlik', color: 'text-red-400' };
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Summary */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-1 w-8 h-8 p-0 bg-slate-700 hover:bg-slate-600 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <p className="text-slate-400">
                {profile.gender === 'male' ? 'Erkak' : 'Ayol'} • 
                {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()} yosh
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Faol
                </Badge>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800/90 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{physicalData.bmi}</div>
            <div className="text-sm text-slate-400">BMI</div>
            <div className={`text-xs ${getBMICategory(physicalData.bmi).color}`}>
              {getBMICategory(physicalData.bmi).text}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/90 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{healthGoals.dailyCalories}</div>
            <div className="text-sm text-slate-400">Kunlik kaloriya</div>
            <div className="text-xs text-blue-300">maqsad</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Haftalik maqsadlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Qadam</span>
              <span className="text-green-400">8,247 / 10,000</span>
            </div>
            <Progress value={82} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Suv</span>
              <span className="text-blue-400">6 / 8 stakan</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Mashq</span>
              <span className="text-orange-400">3 / 5 kun</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonalTab = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Shaxsiy ma'lumotlar</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(isEditing === 'personal' ? null : 'personal')}
              className="text-slate-300 hover:text-white"
            >
              {isEditing === 'personal' ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">To'liq ism</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              disabled={isEditing !== 'personal'}
              className="mt-2 bg-slate-700 border-slate-600 text-white disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="text-white">Username (ixtiyoriy)</Label>
            <Input
              value={profile.username || ''}
              onChange={(e) => setProfile({...profile, username: e.target.value})}
              disabled={isEditing !== 'personal'}
              placeholder="@username"
              className="mt-2 bg-slate-700 border-slate-600 text-white disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="text-white">Email (ixtiyoriy)</Label>
            <Input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              disabled={isEditing !== 'personal'}
              placeholder="email@example.com"
              className="mt-2 bg-slate-700 border-slate-600 text-white disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="text-white">Jins</Label>
            <RadioGroup
              value={profile.gender}
              onValueChange={(value) => setProfile({...profile, gender: value as any})}
              disabled={isEditing !== 'personal'}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" disabled={isEditing !== 'personal'} />
                <Label htmlFor="male" className="text-white">Erkak</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" disabled={isEditing !== 'personal'} />
                <Label htmlFor="female" className="text-white">Ayol</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white">Tug'ilgan sana</Label>
            <Input
              type="date"
              value={profile.birthDate}
              onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
              disabled={isEditing !== 'personal'}
              className="mt-2 bg-slate-700 border-slate-600 text-white disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="text-white">Bio (ixtiyoriy)</Label>
            <Textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              disabled={isEditing !== 'personal'}
              placeholder="O'zingiz haqingizda qisqacha..."
              className="mt-2 bg-slate-700 border-slate-600 text-white disabled:opacity-60"
            />
          </div>

          {isEditing === 'personal' && (
            <div className="flex space-x-3 pt-4">
              <Button onClick={saveProfile} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Saqlash
              </Button>
              <Button
                onClick={() => setIsEditing(null)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
              >
                Bekor qilish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Language & Region */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Til va hudud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Til</Label>
            <Select value={appSettings.language} onValueChange={(value) => 
              setAppSettings({...appSettings, language: value as any})
            }>
              <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="uz">O'zbek</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Mavzu</Label>
            <Select value={appSettings.theme} onValueChange={(value) => {
              setAppSettings({...appSettings, theme: value as any});
              setTheme(value as any);
            }}>
              <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="light">🌞 Yorug'</SelectItem>
                <SelectItem value="dark">🌙 Qorong'u</SelectItem>
                <SelectItem value="system">⚙️ Tizim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Valyuta</Label>
            <Select value={appSettings.currency} onValueChange={(value) => 
              setAppSettings({...appSettings, currency: value as any})
            }>
              <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="UZS">🇺🇿 UZS</SelectItem>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                <SelectItem value="RUB">🇷🇺 RUB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data & Sync */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Ma'lumotlar va sinxronlash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Avtomatik sinxronlash</Label>
              <p className="text-sm text-slate-400">Ma'lumotlarni avtomatik saqlash</p>
            </div>
            <Switch
              checked={appSettings.autoSync}
              onCheckedChange={(checked) => 
                setAppSettings({...appSettings, autoSync: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Offline rejim</Label>
              <p className="text-sm text-slate-400">Internet'siz ishlash</p>
            </div>
            <Switch
              checked={appSettings.offlineMode}
              onCheckedChange={(checked) => 
                setAppSettings({...appSettings, offlineMode: checked})
              }
            />
          </div>

          <div>
            <Label className="text-white">Ma'lumotlar sarfi</Label>
            <Select value={appSettings.dataUsage} onValueChange={(value) => 
              setAppSettings({...appSettings, dataUsage: value as any})
            }>
              <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="low">Kam</SelectItem>
                <SelectItem value="medium">O'rtacha</SelectItem>
                <SelectItem value="high">Yuqori</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Button onClick={saveProfile} className="w-full bg-green-600 hover:bg-green-700">
        <Save className="w-4 h-4 mr-2" />
        Sozlamalarni saqlash
      </Button>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Export Data */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Ma'lumotlarni eksport qilish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400 text-sm">
            Barcha ma'lumotlaringizni JSON formatida yuklab oling
          </p>
          <Button onClick={exportData} variant="outline" className="w-full border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Ma'lumotlarni yuklab olish
          </Button>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Hisob boshqaruvi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Ma'lumotlarni qayta yuklash
          </Button>
          
          <Button variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Barcha ma'lumotlarni tozalash
          </Button>

          <Button 
            onClick={deleteAccount}
            variant="outline" 
            className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Hisobni o'chirish
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-slate-800/90 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Hisob ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Yaratilgan:</span>
            <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Noma\'lum'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Oxirgi yangilanish:</span>
            <span className="text-white">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Hech qachon'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Telegram ID:</span>
            <span className="text-white">{user?.telegramId || 'Bog\'lanmagan'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">App versiyasi:</span>
            <span className="text-white">v1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
            Profil va sozlamalar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300"
          >
            To'liq professional boshqaruv
          </motion.p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700 mb-6">
            <TabsTrigger value="overview" className="text-xs">Asosiy</TabsTrigger>
            <TabsTrigger value="personal" className="text-xs">Shaxsiy</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Sozlamalar</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">Ma'lumotlar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="personal">{renderPersonalTab()}</TabsContent>
          <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
          <TabsContent value="data">{renderDataTab()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}