import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Activity, Target, Brain, 
  Sparkles, ArrowRight, Award, 
  TrendingUp, Shield, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTelegram } from '@/hooks/use-telegram';

const features = [
  {
    icon: Heart,
    title: 'Sog\'liq monitoring',
    description: 'Kundalik sog\'liq ko\'rsatkichlarini kuzating',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: Activity,
    title: 'Faollik kuzatuvi',
    description: 'Qadamlar, mashqlar va kaloriya hisoblash',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Brain,
    title: 'AI tavsiyalar',
    description: 'Shaxsiy sog\'liq bo\'yicha maslahatlar',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Target,
    title: 'Maqsadlarga erishish',
    description: 'O\'z maqsadlaringizni belgilang va ularga erishing',
    color: 'from-green-500 to-emerald-500'
  }
];

const benefits = [
  'Shaxsiylashtirilgan ovqatlanish rejasi',
  'Kundalik kaloriya hisobi',
  'Mashqlar va faollik tavsiyalari',
  'Uyqu va suv iste\'moli monitoring',
  'Haftalik va oylik tahlillar',
  'AI yordamchi doimo yoningizda'
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user: telegramUser, hapticFeedback } = useTelegram();
  
  const handleStartOnboarding = () => {
    hapticFeedback.impact('medium');
    // Set flag that user has started onboarding
    localStorage.setItem('hasStartedOnboarding', 'true');
    // Reload to trigger onboarding through routing logic
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Yurlo AI
          </h1>
          
          <p className="text-lg text-slate-300 mb-2">
            Sizning shaxsiy sog'liq yordamchingiz
          </p>
          
          <p className="text-sm text-slate-400">
            Salom {telegramUser?.first_name || 'do\'stim'}! Keling, birgalikda sog'lom hayot tarzini yaratamiz
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-slate-800/90 border-slate-700/50 hover:bg-slate-700/90 transition-all duration-300">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/90 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-yellow-400 mr-2" />
                <h2 className="text-lg font-semibold text-white">Nima uchun Yurlo AI?</h2>
              </div>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">10K+</div>
            <div className="text-xs text-slate-400">Foydalanuvchilar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">4.9</div>
            <div className="text-xs text-slate-400">Reyting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">98%</div>
            <div className="text-xs text-slate-400">Mamnunlik</div>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <Shield className="w-4 h-4" />
            <span>Ma'lumotlaringiz xavfsiz saqlanadi</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent"
        >
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleStartOnboarding}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">Boshlash</span>
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </Button>
            
            <p className="text-center text-xs text-slate-500 mt-3">
              Davom etish orqali siz <span className="text-slate-400">foydalanish shartlariga</span> rozilik bildirasiz
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}