import {
  Plus,
  Droplets,
  Activity,
  Target,
  TrendingUp,
  Calendar,
  Footprints,
  Moon,
  Dumbbell,
  Brain,
  Flame,
  Apple,
  Clock,
  MoreHorizontal,
  Bell,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Circular Progress Component with responsive sizing
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 180,
  strokeWidth = 12,
  color = "#10B981",
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
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
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function FixedIndex() {
  const { user } = useUser();
  const { user: telegramUser, hapticFeedback } = useTelegram();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Mock data for demonstration
  const todayData = {
    calories: { consumed: 1745, target: 2200 },
    water: { glasses: 6, target: 8 },
    steps: { count: 8247, target: 10000 },
    sleep: { hours: 7.5, target: 8 },
    protein: { consumed: 78, target: 120 },
    carbs: { consumed: 195, target: 250 },
    fat: { consumed: 58, target: 80 },
  };

  const recentMeals = [
    { name: "Kok choy", calories: 2 },
    { name: "Guruch", calories: 130 },
    { name: "Osh", calories: 420 },
    { name: "Breakfast", calories: 450 },
    { name: "Lunch", calories: 650 },
  ];

  const streak = { current: 7, longest: 15 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 min-h-screen">
        {/* Header */}
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white"
              >
                {getGreeting()}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-300 font-medium"
              >
                {user?.name || telegramUser?.first_name || "Samandar"}!
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <Button
                variant="ghost"
                size="sm"
                className="relative text-slate-300 hover:text-white p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </Button>
            </motion.div>
          </div>
          
          {/* Date Display */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-slate-400 mt-1"
          >
            Bugun, {currentTime.toLocaleDateString('uz-UZ', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
        </div>

        {/* Main Calorie Circle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
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

              <div className="flex items-center justify-center mb-6">
                <CircularProgress
                  value={todayData.calories.consumed}
                  max={todayData.calories.target}
                  size={180}
                  strokeWidth={12}
                  color="#10B981"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {todayData.calories.consumed.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400 uppercase tracking-wide">
                      BUGUN YO'QILGAN KALORIYA
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      maqsad: {todayData.calories.target.toLocaleString()} kcal
                    </div>
                  </div>
                </CircularProgress>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Nutrition Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Oziq-ovqat tarkibi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{todayData.protein.consumed}g</div>
                  <div className="text-xs text-slate-400">Oqsil</div>
                  <div className="text-xs text-slate-500">{todayData.protein.target}g</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{todayData.carbs.consumed}g</div>
                  <div className="text-xs text-slate-400">Uglevod</div>
                  <div className="text-xs text-slate-500">{todayData.carbs.target}g</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">{todayData.fat.consumed}g</div>
                  <div className="text-xs text-slate-400">Yog'</div>
                  <div className="text-xs text-slate-500">{todayData.fat.target}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                So'nggi ovqatlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMeals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-white font-medium">{meal.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">{meal.calories} kal</span>
                      <Button size="sm" variant="ghost" className="p-1 text-slate-400 hover:text-white">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                AI Tahlil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{todayData.steps.count.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Kunlik o'rtacha</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{streak.current}</div>
                  <div className="text-sm text-slate-400">Joriy streak</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-slate-700/50 rounded-lg p-3 flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-white">Kunlik maqsadga erishish uchun yana 349 qadam tashlang</span>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-white">Har kuni muntazam yurish rejimini yarating</span>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-white">Yangi streak boshlang - bugun maqsadga erishing!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-4 mb-20"
        >
          <Link to="/daily-tracking">
            <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl hover:bg-slate-700/90 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-medium">Tracking</h3>
                <p className="text-xs text-slate-400">Kundalik ma'lumotlar</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/analytics">
            <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl hover:bg-slate-700/90 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-medium">Tahlil</h3>
                <p className="text-xs text-slate-400">Statistika</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}