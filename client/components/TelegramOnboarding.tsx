/**
 * Professional Telegram Onboarding Component
 * Comprehensive user onboarding with data collection
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  Target, 
  Activity, 
  Heart, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Utensils,
  Droplets,
  Moon,
  Zap,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useTelegram } from '@/hooks/use-telegram';
import TelegramUserService, { UserProfile } from '@/services/telegram-user-service';
import { useI18n } from '@/contexts/I18nContext';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

interface OnboardingData {
  // Personal Info
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  
  // Goals
  goalType: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle';
  targetWeight?: number;
  
  // Activity Level
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Preferences
  language: 'uz' | 'ru' | 'en';
  units: 'metric' | 'imperial';
  notifications: boolean;
}

const TelegramOnboarding: React.FC = () => {
  const { user: telegramUser, cloudStorage, hapticFeedback, showAlert } = useTelegram();
  const { setLanguage } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    language: 'uz',
    units: 'metric',
    notifications: true,
  });

  // Personal Info Step
  const PersonalInfoStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <User className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Shaxsiy ma'lumotlar</h2>
        <p className="text-muted-foreground">Sizga mos tavsiyalar berish uchun</p>
      </div>

      <div className="space-y-4">
        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium">Yoshingiz</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={onboardingData.age || ''}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              className="pl-10 input-responsive focus-professional"
              min="16"
              max="100"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Jins</Label>
          <RadioGroup
            value={onboardingData.gender}
            onValueChange={(value) => setOnboardingData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" className="focus-professional" />
              <Label htmlFor="male" className="text-sm cursor-pointer">Erkak 👨</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" className="focus-professional" />
              <Label htmlFor="female" className="text-sm cursor-pointer">Ayol 👩</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height" className="text-sm font-medium">Bo'y (sm)</Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={onboardingData.height || ''}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              className="pl-10 input-responsive focus-professional"
              min="120"
              max="250"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-sm font-medium">Vazn (kg)</Label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={onboardingData.weight || ''}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
              className="pl-10 input-responsive focus-professional"
              min="30"
              max="300"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Goals Step
  const GoalsStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Target className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Maqsadingiz nima?</h2>
        <p className="text-muted-foreground">Sizga mos rejani tuzamiz</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'lose_weight', title: 'Vazn kamaytirish', subtitle: 'Sog\'lom yo\'l bilan ozish', icon: '📉', color: 'from-red-500 to-pink-500' },
          { id: 'maintain_weight', title: 'Vaznni saqlash', subtitle: 'Hozirgi holatni ushlab turish', icon: '⚖️', color: 'from-blue-500 to-cyan-500' },
          { id: 'gain_weight', title: 'Vazn ko\'paytirish', subtitle: 'Sog\'lom yo\'l bilan semirish', icon: '📈', color: 'from-green-500 to-emerald-500' },
          { id: 'build_muscle', title: 'Mushak qurish', subtitle: 'Kuch va massa oshirish', icon: '💪', color: 'from-purple-500 to-violet-500' },
        ].map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 mobile-tap-highlight ${
                onboardingData.goalType === goal.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setOnboardingData(prev => ({ ...prev, goalType: goal.id as any }));
                hapticFeedback.selection();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {goal.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.subtitle}</p>
                  </div>
                  {onboardingData.goalType === goal.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {(onboardingData.goalType === 'lose_weight' || onboardingData.goalType === 'gain_weight') && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="targetWeight" className="text-sm font-medium">Maqsad vazn (kg)</Label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="targetWeight"
              type="number"
              placeholder={onboardingData.goalType === 'lose_weight' ? '65' : '75'}
              value={onboardingData.targetWeight || ''}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, targetWeight: parseInt(e.target.value) }))}
              className="pl-10 input-responsive focus-professional"
            />
          </div>
        </motion.div>
      )}
    </div>
  );

  // Activity Level Step
  const ActivityStep: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Activity className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Faollik darajangiz</h2>
        <p className="text-muted-foreground">Kundalik hayot tarzingiz</p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'sedentary', title: 'Kam harakatchan', subtitle: 'Asosan o\'tirib ishlash, kam sport', icon: '🪑', multiplier: '1.2x' },
          { id: 'light', title: 'Engil faol', subtitle: 'Haftada 1-3 marta sport', icon: '🚶', multiplier: '1.375x' },
          { id: 'moderate', title: 'O\'rtacha faol', subtitle: 'Haftada 3-5 marta sport', icon: '🏃', multiplier: '1.55x' },
          { id: 'active', title: 'Faol', subtitle: 'Haftada 6-7 marta sport', icon: '🏋️', multiplier: '1.725x' },
          { id: 'very_active', title: 'Juda faol', subtitle: 'Kundalik og\'ir mashqlar', icon: '🥇', multiplier: '1.9x' },
        ].map((activity) => (
          <motion.div
            key={activity.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 mobile-tap-highlight ${
                onboardingData.activityLevel === activity.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setOnboardingData(prev => ({ ...prev, activityLevel: activity.id as any }));
                hapticFeedback.selection();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{activity.multiplier}</Badge>
                    {onboardingData.activityLevel === activity.id && (
                      <CheckCircle className="w-5 h-5 text-primary mt-1 ml-auto" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Success Step
  const SuccessStep: React.FC = () => (
    <div className="space-y-6 text-center">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl"
      >
        <Trophy className="w-12 h-12 text-white" />
      </motion.div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-foreground">Tabriklaymiz! 🎉</h2>
        <p className="text-lg text-muted-foreground">Profilingiz muvaffaqiyatli yaratildi</p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Sizning ma'lumotlaringiz:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <span className="text-muted-foreground">Yosh:</span>
            <span className="ml-2 font-medium">{onboardingData.age}</span>
          </div>
          <div className="text-left">
            <span className="text-muted-foreground">Jins:</span>
            <span className="ml-2 font-medium">{onboardingData.gender === 'male' ? 'Erkak' : 'Ayol'}</span>
          </div>
          <div className="text-left">
            <span className="text-muted-foreground">Bo'y:</span>
            <span className="ml-2 font-medium">{onboardingData.height} sm</span>
          </div>
          <div className="text-left">
            <span className="text-muted-foreground">Vazn:</span>
            <span className="ml-2 font-medium">{onboardingData.weight} kg</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI yordamchi tayyor!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Shaxsiy tavsiyalar va rejalar olishni boshlang
        </p>
      </div>
    </div>
  );

  const steps: OnboardingStep[] = [
    { id: 'personal', title: 'Shaxsiy ma\'lumotlar', subtitle: 'Asosiy ma\'lumotlar', icon: User, component: PersonalInfoStep },
    { id: 'goals', title: 'Maqsadlar', subtitle: 'Sizning niyatingiz', icon: Target, component: GoalsStep },
    { id: 'activity', title: 'Faollik', subtitle: 'Hayot tarzi', icon: Activity, component: ActivityStep },
    { id: 'success', title: 'Tayyor!', subtitle: 'Muvaffaqiyat', icon: Trophy, component: SuccessStep },
  ];

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!(onboardingData.age && onboardingData.gender && onboardingData.height && onboardingData.weight);
      case 1:
        return !!onboardingData.goalType;
      case 2:
        return !!onboardingData.activityLevel;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!isStepValid()) {
      hapticFeedback.notification('error');
      showAlert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    hapticFeedback.impact('light');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    hapticFeedback.impact('light');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!telegramUser) return;
    
    setIsLoading(true);
    
    try {
      const userService = TelegramUserService.getInstance(cloudStorage);
      
      // Create user profile
      const profile = await userService.createInitialProfile(telegramUser);
      
      // Update with onboarding data
      const updates: Partial<UserProfile> = {
        age: onboardingData.age,
        gender: onboardingData.gender,
        height: onboardingData.height,
        weight: onboardingData.weight,
        activityLevel: onboardingData.activityLevel,
        goals: {
          type: onboardingData.goalType!,
          targetWeight: onboardingData.targetWeight,
          targetCalories: userService.calculateGoalCalories({ ...profile, ...onboardingData } as UserProfile),
          ...(userService.calculateMacroTargets({ ...profile, ...onboardingData } as UserProfile)),
        },
        preferences: {
          ...profile.preferences,
          language: onboardingData.language || 'uz',
          units: onboardingData.units || 'metric',
          notifications: onboardingData.notifications ?? true,
        },
        completedOnboarding: true,
      };
      
      await userService.updateUserProfile(updates);
      // Apply chosen language globally
      if (updates.preferences?.language) {
        setLanguage(updates.preferences.language as any);
      }
      
      hapticFeedback.notification('success');
      
      // Navigate to main app
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 dark:from-background dark:via-card dark:to-muted/20">
      <div className="container-mobile min-h-screen flex flex-col">
        {/* Header */}
        <div className="telegram-header-safe pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="brand-heading text-lg">Yurlo AI</h1>
                <p className="brand-subheading text-xs">Sog'liq yordamchingiz</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="theme-card shadow-xl">
                <CardContent className="padding-responsive">
                  <CurrentStepComponent />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border/30 backdrop-blur-xl p-4 telegram-safe-area">
          <div className="container-mobile flex-center-responsive">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="mr-auto"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orqaga
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className="ml-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Davom etish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isLoading ? 'Saqlanmoqda...' : 'Boshlash'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramOnboarding;