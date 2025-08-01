/**
 * Fixed Onboarding Component
 * Ensures user data is collected only once and proper navigation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, ArrowRight, ArrowLeft, Check, Target, Activity,
  Calendar, Ruler, Weight, Heart, Clock, Zap, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';

interface OnboardingData {
  name: string;
  gender: 'male' | 'female';
  birthYear: string;
  height: string;
  weight: string;
  activityLevel: 'low' | 'medium' | 'high';
  goal: 'lose' | 'maintain' | 'gain';
  sleepTime: string;
  wakeTime: string;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Xush kelibsiz!',
    subtitle: 'Yurlo AI bilan sog\'liq va fitnes yo\'lingizni boshlaylik',
    icon: User
  },
  {
    id: 'basic_info',
    title: 'Asosiy ma\'lumotlar',
    subtitle: 'Sizning shaxsiy ma\'lumotlaringiz',
    icon: User
  },
  {
    id: 'physical_info',
    title: 'Jismoniy ma\'lumotlar',
    subtitle: 'Bo\'y va vazn ma\'lumotlari',
    icon: Ruler
  },
  {
    id: 'goals',
    title: 'Maqsadlaringiz',
    subtitle: 'Nima uchun Yurlo AI dan foydalanmoqchisiz?',
    icon: Target
  },
  {
    id: 'schedule',
    title: 'Kundalik rejim',
    subtitle: 'Uyqu va faollik vaqtlari',
    icon: Clock
  },
  {
    id: 'complete',
    title: 'Tayyor!',
    subtitle: 'Barcha ma\'lumotlar saqlandi',
    icon: Check
  }
];

export default function FixedOnboarding() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const { user: telegramUser, hapticFeedback, showAlert } = useTelegram();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: telegramUser?.first_name || '',
    gender: 'male',
    birthYear: '1990',
    height: '',
    weight: '',
    activityLevel: 'medium',
    goal: 'maintain',
    sleepTime: '22:00',
    wakeTime: '07:00'
  });

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
      return;
    }
    
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
      hapticFeedback.impact('light');
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      hapticFeedback.impact('light');
    }
  };

  const validateCurrentStep = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return true;
      case 'basic_info':
        if (!formData.name.trim()) {
          showAlert('Iltimos, ismingizni kiriting');
          return false;
        }
        return true;
      case 'physical_info':
        if (!formData.height || !formData.weight) {
          showAlert('Iltimos, bo\'y va vaznni kiriting');
          return false;
        }
        if (parseFloat(formData.height) < 100 || parseFloat(formData.height) > 250) {
          showAlert('Bo\'y 100-250 sm oralig\'ida bo\'lishi kerak');
          return false;
        }
        if (parseFloat(formData.weight) < 30 || parseFloat(formData.weight) > 300) {
          showAlert('Vazn 30-300 kg oralig\'ida bo\'lishi kerak');
          return false;
        }
        return true;
      case 'goals':
      case 'schedule':
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Calculate BMR and daily calories
      const age = new Date().getFullYear() - parseInt(formData.birthYear);
      const heightNum = parseFloat(formData.height);
      const weightNum = parseFloat(formData.weight);

      let bmr = 0;
      if (formData.gender === 'male') {
        bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
      }

      const activityMultiplier = {
        low: 1.2,
        medium: 1.55,
        high: 1.725,
      };

      const dailyCalories = Math.round(
        bmr * activityMultiplier[formData.activityLevel]
      );

      const userData = {
        telegramId: telegramUser?.id?.toString() || 'demo_user',
        name: formData.name,
        gender: formData.gender,
        birthYear: formData.birthYear,
        age,
        height: formData.height,
        weight: formData.weight,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        sleepTime: formData.sleepTime,
        wakeTime: formData.wakeTime,
        language: telegramUser?.language_code || 'uz',
        bmr: Math.round(bmr),
        dailyCalories,
        isFirstTime: false,
        completedOnboarding: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update user context
      updateUser(userData);
      
      hapticFeedback.notification('success');
      showAlert('Ma\'lumotlar muvaffaqiyatli saqlandi!');
      
      // Navigate to main page
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Onboarding error:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Yurlo AI ga xush kelibsiz!</h2>
              <p className="text-slate-300">
                Sog'liq va fitnes yo'lingizda professional yordamchingiz. 
                Keling, sizni tanishtiraylik!
              </p>
            </div>
          </div>
        );

      case 'basic_info':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white">Ismingiz</Label>
              <Input
                type="text"
                placeholder="Ismingizni kiriting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Jins</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="text-white">Erkak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="text-white">Ayol</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-white">Tug'ilgan yil</Label>
              <Input
                type="number"
                placeholder="1990"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
                min="1940"
                max="2010"
              />
            </div>
          </div>
        );

      case 'physical_info':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white">Bo'y (sm)</Label>
              <Input
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
                min="100"
                max="250"
              />
            </div>
            
            <div>
              <Label className="text-white">Vazn (kg)</Label>
              <Input
                type="number"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            <div>
              <Label className="text-white">Faollik darajasi</Label>
              <RadioGroup
                value={formData.activityLevel}
                onValueChange={(value) => setFormData({ ...formData, activityLevel: value as any })}
                className="mt-2 space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-white">Kam faol (deyarlik sport qilmayman)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-white">O'rtacha faol (haftada 3-5 marta)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-white">Juda faol (har kuni sport)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white">Asosiy maqsadingiz</Label>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value as any })}
                className="mt-2 space-y-3"
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
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-white">Uxlash vaqti</Label>
              <Input
                type="time"
                value={formData.sleepTime}
                onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Uyg'onish vaqti</Label>
              <Input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Hammasi tayyor!</h2>
              <p className="text-slate-300">
                Siz muvaffaqiyatli ro'yxatdan o'tdingiz. 
                Endi Yurlo AI sizning shaxsiy health assistentingiz!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/90 border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <currentStepData.icon className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-white">{currentStepData.title}</CardTitle>
            <p className="text-slate-300 text-sm">{currentStepData.subtitle}</p>
            
            {/* Progress indicator */}
            <div className="flex justify-center space-x-2 mt-4">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-green-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isFirstStep}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orqaga
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : isLastStep ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saqlanmoqda...' : isLastStep ? 'Boshlash' : 'Keyingisi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}