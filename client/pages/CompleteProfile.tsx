import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, Edit3, Save, X, Trash2, Upload, Camera,
  Weight, Ruler, Calendar, Target, Activity, Globe, Bell,
  Shield, Download, RefreshCw, CheckCircle, AlertTriangle,
  Eye, EyeOff, Lock, Mail, Phone, MapPin, Award, TrendingUp,
  Heart, BarChart3, Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';

interface ProfileStats {
  totalCalories: number;
  totalSteps: number;
  totalWorkouts: number;
  avgSleep: number;
  streak: number;
  joinDate: string;
}

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

export default function CompleteProfile() {
  const { user, updateUser, clearUser } = useUser();
  const { user: telegramUser, hapticFeedback, showAlert } = useTelegram();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState(user || {});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'settings'>('info');
  const [notifications, setNotifications] = useState({
    meals: true,
    water: true,
    sleep: true,
    workouts: false,
    achievements: true
  });

  // Mock stats data
  const stats: ProfileStats = {
    totalCalories: 45320,
    totalSteps: 187590,
    totalWorkouts: 23,
    avgSleep: 7.3,
    streak: 12,
    joinDate: '2024-01-15'
  };

  const editableFields: EditableField[] = [
    {
      key: 'name',
      label: 'Ism',
      type: 'text',
      validation: (value) => value.length >= 2,
      errorMessage: 'Ism kamida 2 ta harf bo\'lishi kerak'
    },
    {
      key: 'weight',
      label: 'Vazn (kg)',
      type: 'number',
      validation: (value) => parseFloat(value) >= 30 && parseFloat(value) <= 300,
      errorMessage: 'Vazn 30-300 kg orasida bo\'lishi kerak'
    },
    {
      key: 'height',
      label: 'Bo\'y (sm)',
      type: 'number',
      validation: (value) => parseFloat(value) >= 100 && parseFloat(value) <= 250,
      errorMessage: 'Bo\'y 100-250 sm orasida bo\'lishi kerak'
    },
    {
      key: 'birthYear',
      label: 'Tug\'ilgan yil',
      type: 'number',
      validation: (value) => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= 1940 && year <= currentYear - 10;
      },
      errorMessage: 'Yaroqli yil kiriting'
    },
    {
      key: 'goal',
      label: 'Maqsad',
      type: 'select',
      options: ['lose', 'maintain', 'gain'],
      validation: (value) => ['lose', 'maintain', 'gain'].includes(value)
    },
    {
      key: 'activityLevel',
      label: 'Faollik darajasi',
      type: 'select',
      options: ['low', 'medium', 'high'],
      validation: (value) => ['low', 'medium', 'high'].includes(value)
    },
    {
      key: 'language',
      label: 'Til',
      type: 'select',
      options: ['uz', 'ru', 'en'],
      validation: (value) => ['uz', 'ru', 'en'].includes(value)
    }
  ];

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleFieldEdit = (fieldKey: string) => {
    setEditingField(fieldKey);
    hapticFeedback.impact('light');
  };

  const handleFieldSave = async (fieldKey: string) => {
    const field = editableFields.find(f => f.key === fieldKey);
    const value = String((formData as any)[fieldKey] ?? '');
    
    if (field?.validation && !field.validation(value)) {
      showAlert(field.errorMessage || 'Noto\'g\'ri qiymat');
      hapticFeedback.notification('error');
      return;
    }

    try {
      const updatedUser = { ...user, ...formData };
      
      // Recalculate BMR and calories if weight, height, or age changed
      if (['weight', 'height', 'birthYear'].includes(fieldKey)) {
        const age = new Date().getFullYear() - parseInt(updatedUser.birthYear);
        const heightNum = parseFloat(updatedUser.height);
        const weightNum = parseFloat(updatedUser.weight);

        let bmr = 0;
        if (updatedUser.gender === 'male') {
          bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
        } else {
          bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
        }

        const activityMultiplier = { low: 1.2, medium: 1.55, high: 1.725 };
        const dailyCalories = Math.round(bmr * activityMultiplier[updatedUser.activityLevel as keyof typeof activityMultiplier]);

        updatedUser.age = age;
        updatedUser.bmr = Math.round(bmr);
        updatedUser.dailyCalories = dailyCalories;
      }

      updatedUser.updatedAt = new Date().toISOString();
      updateUser(updatedUser);
      
      setEditingField(null);
      hapticFeedback.notification('success');
      showAlert('Ma\'lumot yangilandi');
    } catch (error) {
      console.error('Error updating profile:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi');
    }
  };

  const handleFieldCancel = (fieldKey: string) => {
    setFormData(user || {});
    setEditingField(null);
    hapticFeedback.impact('light');
  };

  const handleDeleteProfile = () => {
    setShowDeleteConfirm(true);
    hapticFeedback.impact('medium');
  };

  const confirmDeleteProfile = () => {
    clearUser();
    localStorage.clear();
    hapticFeedback.notification('success');
    showAlert('Profil o\'chirildi');
    setShowDeleteConfirm(false);
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yurlo-ai-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    hapticFeedback.notification('success');
    showAlert('Ma\'lumotlar yuklab olindi');
  };

  const getFieldDisplayValue = (key: string, value: any) => {
    switch (key) {
      case 'goal':
        return value === 'lose' ? 'Vazn kamaytirish' : 
               value === 'maintain' ? 'Vaznni saqlash' : 'Vazn oshirish';
      case 'activityLevel':
        return value === 'low' ? 'Kam faol' : 
               value === 'medium' ? 'O\'rtacha faol' : 'Juda faol';
      case 'language':
        return value === 'uz' ? 'O\'zbek' : 
               value === 'ru' ? 'Русский' : 'English';
      case 'gender':
        return value === 'male' ? 'Erkak' : 'Ayol';
      default:
        return value;
    }
  };

  const getSelectOptions = (options: string[], key: string) => {
    return options.map(option => ({
      value: option,
      label: getFieldDisplayValue(key, option)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Profil topilmadi</h2>
            <p className="text-slate-400 mb-4">Avval ro'yxatdan o'ting</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Qayta yuklash
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 min-h-screen">
        {/* Header */}
        <div className="pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400">
              {user.age} yosh • {getFieldDisplayValue('gender', user.gender)}
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800/50 rounded-xl">
            {(['info', 'stats', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab === 'info' ? 'Ma\'lumotlar' : tab === 'stats' ? 'Statistika' : 'Sozlamalar'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-20"
          >
            {activeTab === 'info' && (
              <>
                {/* Basic Info */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Shaxsiy ma'lumotlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editableFields.filter(f => ['name', 'weight', 'height', 'birthYear'].includes(f.key)).map((field) => (
                      <div key={field.key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm text-slate-300">{field.label}</Label>
                          {editingField === field.key ? (
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                type={field.type}
                                value={formData[field.key as keyof typeof formData] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="flex-1 bg-slate-600 border-slate-500 text-white"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleFieldSave(field.key)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFieldCancel(field.key)}
                                className="text-slate-400 hover:text-white p-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-white font-medium">
                              {getFieldDisplayValue(field.key, formData[field.key as keyof typeof formData])}
                              {field.key === 'weight' && ' kg'}
                              {field.key === 'height' && ' sm'}
                            </p>
                          )}
                        </div>
                        {editingField !== field.key && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFieldEdit(field.key)}
                            className="text-slate-400 hover:text-white p-2"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Goals & Preferences */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Maqsadlar va sozlamalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editableFields.filter(f => ['goal', 'activityLevel', 'language'].includes(f.key)).map((field) => (
                      <div key={field.key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm text-slate-300">{field.label}</Label>
                          {editingField === field.key ? (
                            <div className="flex items-center space-x-2 mt-1">
                              <Select
                                value={formData[field.key as keyof typeof formData] || ''}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                              >
                                <SelectTrigger className="flex-1 bg-slate-600 border-slate-500 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getSelectOptions(field.options || [], field.key).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleFieldSave(field.key)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleFieldCancel(field.key)}
                                className="text-slate-400 hover:text-white p-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-white font-medium">
                              {getFieldDisplayValue(field.key, formData[field.key as keyof typeof formData])}
                            </p>
                          )}
                        </div>
                        {editingField !== field.key && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFieldEdit(field.key)}
                            className="text-slate-400 hover:text-white p-2"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Calculated Metrics */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Hisoblangan ko'rsatkichlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">BMR (Asosiy almashinuv)</span>
                      <span className="text-white font-semibold">{user.bmr} kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Kunlik kaloriya</span>
                      <span className="text-white font-semibold">{user.dailyCalories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">BMI</span>
                      <span className="text-white font-semibold">
                        {((parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'stats' && (
              <>
                {/* Achievement Overview */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Yutuqlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{stats.streak}</div>
                        <div className="text-xs text-slate-400">Kunlik streak</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{stats.totalWorkouts}</div>
                        <div className="text-xs text-slate-400">Jami mashqlar</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Statistics */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Umumiy statistika
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Jami kaloriya</p>
                          <p className="text-xs text-slate-400">Barcha vaqt</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-white">{stats.totalCalories.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Jami qadamlar</p>
                          <p className="text-xs text-slate-400">Barcha vaqt</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-white">{stats.totalSteps.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">O'rtacha uyqu</p>
                          <p className="text-xs text-slate-400">Har kuni</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-white">{stats.avgSleep}h</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Membership Info */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      A'zolik ma'lumotlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Qo'shilgan sana</span>
                        <span className="text-white">{new Date(stats.joinDate).toLocaleDateString('uz-UZ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Faol kunlar</span>
                        <span className="text-white">{Math.floor((Date.now() - new Date(stats.joinDate).getTime()) / (1000 * 60 * 60 * 24))} kun</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Oxirgi yangilanish</span>
                        <span className="text-white">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('uz-UZ') : 'Hech qachon'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'settings' && (
              <>
                {/* Notification Settings */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Bildirishnomalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-white">
                          {key === 'meals' ? 'Ovqat eslatmalari' :
                           key === 'water' ? 'Suv eslatmalari' :
                           key === 'sleep' ? 'Uyqu eslatmalari' :
                           key === 'workouts' ? 'Mashq eslatmalari' :
                           'Yutuq bildirishnomalari'}
                        </span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Ma'lumotlar boshqaruvi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleExportData}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ma'lumotlarni yuklab olish
                    </Button>
                    
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Ilovani yangilash
                    </Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Xavfli zona
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-4">
                      Bu amal qaytarib bo'lmaydi. Barcha ma'lumotlaringiz o'chiriladi.
                    </p>
                    <Button
                      onClick={handleDeleteProfile}
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Profilni o'chirish
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-xl p-6 w-full max-w-sm"
              >
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Profilni o'chirishni tasdiqlang
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Bu amal qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay o'chiriladi.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      onClick={confirmDeleteProfile}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      O'chirish
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}