import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Droplets, Activity, Target, TrendingUp, Moon, Dumbbell,
  Brain, Flame, Apple, Clock, Bell, Zap, Heart, Award, Timer,
  Coffee, Utensils, Shield, Play, BarChart3, Footprints, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
  label?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = "#10B981",
  children,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(71 85 105)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
      {label && (
        <span className="text-xs text-slate-400 mt-2 text-center">{label}</span>
      )}
    </div>
  );
};

// Health Metric Card Component
interface HealthMetricProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  color: string;
  progress?: number;
  onClick?: () => void;
}

const HealthMetric: React.FC<HealthMetricProps> = ({
  icon: Icon,
  title,
  value,
  target,
  unit = '',
  color,
  progress = 0,
  onClick
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <Card className="bg-slate-800/90 border-slate-700/50 hover:bg-slate-700/90 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {progress > 0 && (
            <div className="text-right">
              <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-300">{title}</h3>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs text-slate-400">{unit}</span>}
          </div>
          {target && (
            <p className="text-xs text-slate-500">Maqsad: {target}{unit}</p>
          )}
        </div>
        
        {progress > 0 && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Quick Action Button Component
interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  to?: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  subtitle,
  color,
  to,
  onClick
}) => {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="bg-slate-800/90 border-slate-700/50 hover:bg-slate-700/90 transition-all duration-300">
        <CardContent className="p-4 text-center">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

export default function EnhancedIndex() {
  const { user } = useUser();
  const { user: telegramUser, hapticFeedback } = useTelegram();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'today' | 'weekly'>('overview');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Xayrli tong";
    if (hour < 18) return "Xayrli kun";
    return "Xayrli kechqurun";
  };

  // Mock data - real data should come from your data management system
  const todayData = {
    calories: { consumed: 1745, target: 2200 },
    water: { glasses: 6, target: 8 },
    steps: { count: 8247, target: 10000 },
    sleep: { hours: 7.5, target: 8 },
    workouts: { completed: 1, target: 1 },
    heartRate: { current: 72, resting: 65 },
  };

  const weeklyData = {
    caloriesAvg: 1890,
    stepsAvg: 9150,
    sleepAvg: 7.2,
    workoutsTotal: 5
  };

  const quickActions = [
    {
      icon: Utensils,
      title: "Ovqat qo'shish",
      subtitle: "Kaloriya hisoblash",
      color: "from-green-500 to-emerald-600",
      to: "/add-meal"
    },
    {
      icon: Droplets,
      title: "Suv ichish",
      subtitle: "Gidratatsiya",
      color: "from-blue-500 to-cyan-600",
      to: "/water-tracker"
    },
    {
      icon: Dumbbell,
      title: "Mashq qilish",
      subtitle: "Fitness",
      color: "from-orange-500 to-red-600",
      to: "/workout-tracker"
    },
    {
      icon: Moon,
      title: "Uyqu",
      subtitle: "Damlanish",
      color: "from-purple-500 to-violet-600",
      to: "/sleep-tracker"
    }
  ];

  const healthMetrics = [
    {
      icon: Footprints,
      title: "Qadamlar",
      value: todayData.steps.count.toLocaleString(),
      target: todayData.steps.target.toLocaleString(),
      color: "from-blue-500 to-cyan-500",
      progress: (todayData.steps.count / todayData.steps.target) * 100,
      onClick: () => hapticFeedback.impact('light')
    },
    {
      icon: Droplets,
      title: "Suv",
      value: todayData.water.glasses,
      target: todayData.water.target,
      unit: " stakan",
      color: "from-cyan-500 to-blue-500",
      progress: (todayData.water.glasses / todayData.water.target) * 100,
      onClick: () => hapticFeedback.impact('light')
    },
    {
      icon: Moon,
      title: "Uyqu",
      value: todayData.sleep.hours,
      target: todayData.sleep.target,
      unit: " soat",
      color: "from-purple-500 to-violet-500",
      progress: (todayData.sleep.hours / todayData.sleep.target) * 100,
      onClick: () => hapticFeedback.impact('light')
    },
    {
      icon: Heart,
      title: "Yurak urishi",
      value: todayData.heartRate.current,
      target: todayData.heartRate.resting,
      unit: " BPM",
      color: "from-red-500 to-pink-500",
      progress: 85,
      onClick: () => hapticFeedback.impact('light')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 min-h-screen">
        {/* Enhanced Header */}
        <div className="pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}
              </h1>
              <p className="text-slate-300 font-medium">
                {user?.name || telegramUser?.first_name || "Foydalanuvchi"}!
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-slate-300 hover:text-white p-3 rounded-xl hover:bg-slate-800/50"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </Button>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-400"
          >
            Bugun, {currentTime.toLocaleDateString('uz-UZ', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-1 mt-4 p-1 bg-slate-800/50 rounded-xl"
          >
            {(['overview', 'today', 'weekly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab === 'overview' ? 'Umumiy' : tab === 'today' ? 'Bugun' : 'Haftalik'}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <>
                {/* Main Calorie Circle */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-1">
                          Bugungi Kaloriya
                        </h2>
                        <p className="text-sm text-slate-300">
                          Maqsad: {todayData.calories.target.toLocaleString()} kcal
                        </p>
                      </div>
                      <Link to="/add-meal">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          onClick={() => hapticFeedback.impact("light")}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Qo'shish
                        </Button>
                      </Link>
                    </div>

                    <div className="flex justify-center mb-4">
                      <CircularProgress
                        value={todayData.calories.consumed}
                        max={todayData.calories.target}
                        size={160}
                        strokeWidth={12}
                        color="#10B981"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {todayData.calories.consumed.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400 uppercase tracking-wide">
                            KCAL
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            qoldi: {(todayData.calories.target - todayData.calories.consumed).toLocaleString()}
                          </div>
                        </div>
                      </CircularProgress>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    Tezkor harakatlar
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <QuickAction key={index} {...action} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'today' && (
              <>
                {/* Health Metrics Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-400" />
                    Bugungi ko'rsatkichlar
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {healthMetrics.map((metric, index) => (
                      <HealthMetric key={index} {...metric} />
                    ))}
                  </div>
                </div>

                {/* Today's Summary */}
                <Card className="bg-slate-800/90 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Bugungi xulosa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-300">Faollik darajasi</span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Yaxshi
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-300">Maqsadga erishish</span>
                      <span className="text-sm font-semibold text-white">78%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-300">Streak</span>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">7 kun</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'weekly' && (
              <>
                {/* Weekly Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Haftalik natijalar
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="bg-slate-800/90 border-slate-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                          <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white">{weeklyData.caloriesAvg}</div>
                        <div className="text-xs text-slate-400">O'rtacha kcal</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/90 border-slate-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-3">
                          <Footprints className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white">{weeklyData.stepsAvg.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">O'rtacha qadamlar</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/90 border-slate-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-3">
                          <Moon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white">{weeklyData.sleepAvg}h</div>
                        <div className="text-xs text-slate-400">O'rtacha uyqu</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/90 border-slate-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-3">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white">{weeklyData.workoutsTotal}</div>
                        <div className="text-xs text-slate-400">Mashqlar</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Weekly Progress */}
                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Haftalik taraqqiyot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Kaloriya maqsadi</span>
                          <span className="text-white">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Faollik maqsadi</span>
                          <span className="text-white">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Uyqu maqsadi</span>
                          <span className="text-white">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}