import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTelegram } from "@/hooks/use-telegram";
import {
  Footprints,
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Clock,
  Zap,
  MapPin,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Award,
  BarChart3,
  Plus,
  Minus,
  CheckCircle,
  Activity,
  Brain,
  Settings,
} from "lucide-react";

interface StepSession {
  id: string;
  date: string;
  steps: number;
  distance: number; // km
  calories: number;
  duration: number; // minutes
  avgPace?: number; // steps per minute
}

interface StepGoal {
  dailySteps: number;
  weeklySteps: number;
  distance: number;
}

export default function EnhancedStepTracker() {
  const { hapticFeedback, showAlert } = useTelegram();
  const [steps, setSteps] = useState(7348);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'goals'>('today');

  const [stepGoal, setStepGoal] = useState<StepGoal>({
    dailySteps: 10000,
    weeklySteps: 70000,
    distance: 8 // km
  });

  // Mock data for the week
  const weekData: StepSession[] = [
    { id: '1', date: '2024-01-29', steps: 8924, distance: 7.14, calories: 357, duration: 65 },
    { id: '2', date: '2024-01-30', steps: 12456, distance: 9.96, calories: 498, duration: 87 },
    { id: '3', date: '2024-01-31', steps: 6789, distance: 5.43, calories: 271, duration: 52 },
    { id: '4', date: '2024-02-01', steps: 11234, distance: 8.99, calories: 449, duration: 78 },
    { id: '5', date: '2024-02-02', steps: 9876, distance: 7.90, calories: 395, duration: 72 },
    { id: '6', date: '2024-02-03', steps: 15432, distance: 12.35, calories: 617, duration: 98 },
    { id: '7', date: '2024-02-04', steps: 7348, distance: 5.88, calories: 294, duration: 58 },
  ];

  const totalWeekSteps = weekData.reduce((acc, day) => acc + day.steps, 0);
  const avgSteps = Math.round(totalWeekSteps / weekData.length);
  const completedDays = weekData.filter(day => day.steps >= stepGoal.dailySteps).length;
  const totalDistance = weekData.reduce((acc, day) => acc + day.distance, 0);
  const totalCalories = weekData.reduce((acc, day) => acc + day.calories, 0);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulated step tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        const newSteps = Math.floor(Math.random() * 5) + 1;
        setSteps(prev => prev + newSteps);
        setSessionSteps(prev => prev + newSteps);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setSessionStartTime(new Date());
    setSessionSteps(0);
    hapticFeedback.impact('medium');
    showAlert('Qadamlar kuzatuvi boshlandi');
  };

  const stopTracking = () => {
    if (!sessionStartTime) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60);
    const distance = (sessionSteps * 0.0008);
    const calories = Math.round(sessionSteps * 0.04);
    
    setIsTracking(false);
    setSessionStartTime(null);
    hapticFeedback.notification('success');
    showAlert(`Sessiya tugadi: ${sessionSteps} qadamlar, ${duration.toFixed(1)} daqiqa`);

    // Save session to localStorage
    const newSession: StepSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      steps: sessionSteps,
      distance: distance,
      calories: calories,
      duration: Math.round(duration),
      avgPace: Math.round(sessionSteps / duration)
    };

    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`steps_${today}`, JSON.stringify(newSession));
  };

  const resetSteps = () => {
    setSteps(0);
    setSessionSteps(0);
    hapticFeedback.impact('light');
    showAlert('Qadamlar qayta o\'rnatildi');
  };

  const progressPercentage = (steps / stepGoal.dailySteps) * 100;
  const remainingSteps = Math.max(0, stepGoal.dailySteps - steps);
  const currentDistance = steps * 0.0008;
  const currentCalories = Math.round(steps * 0.04);

  const getSessionDuration = () => {
    if (!sessionStartTime) return 0;
    return (currentTime.getTime() - sessionStartTime.getTime()) / (1000 * 60);
  };

  const getStepsCelebration = () => {
    if (steps >= stepGoal.dailySteps * 1.5) return { emoji: '🚀', text: 'Kosmik natija!' };
    if (steps >= stepGoal.dailySteps * 1.2) return { emoji: '⭐', text: 'Ajoyib!' };
    if (steps >= stepGoal.dailySteps) return { emoji: '🎉', text: 'Maqsadga erishdingiz!' };
    if (steps >= stepGoal.dailySteps * 0.8) return { emoji: '💪', text: 'Deyarlik!' };
    if (steps >= stepGoal.dailySteps * 0.5) return { emoji: '👍', text: 'Yaxshi!' };
    return { emoji: '🚶', text: 'Davom eting!' };
  };

  const celebration = getStepsCelebration();

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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Footprints className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Qadamlar Tracker</h1>
            <p className="text-slate-300">Har qadamda sog'likka</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800/50 rounded-xl">
            {(['today', 'week', 'goals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab === 'today' ? 'Bugun' : tab === 'week' ? 'Hafta' : 'Maqsadlar'}
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
            {activeTab === 'today' && (
              <>
                {/* Step Counter Card */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        {steps.toLocaleString()}
                      </div>
                      <p className="text-slate-300">qadamlar</p>
                      <div className="text-2xl mt-2">{celebration.emoji}</div>
                      <p className="text-sm text-blue-400 font-medium">{celebration.text}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Maqsad: {stepGoal.dailySteps.toLocaleString()}</span>
                        <Badge className={`${
                          steps >= stepGoal.dailySteps ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {progressPercentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                      {remainingSteps > 0 && (
                        <p className="text-center text-slate-400 text-sm">
                          Qolgan: {remainingSteps.toLocaleString()} qadamlar
                        </p>
                      )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={isTracking ? stopTracking : startTracking}
                        className={`flex-1 ${
                          isTracking 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                        } text-white`}
                      >
                        {isTracking ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            To'xtatish
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Boshlash
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={resetSteps}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Info */}
                {isTracking && (
                  <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Timer className="w-5 h-5 mr-2" />
                        Joriy sessiya
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{sessionSteps}</div>
                        <div className="text-xs text-slate-400">Qadamlar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{Math.round(getSessionDuration())}m</div>
                        <div className="text-xs text-slate-400">Davomiyligi</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">
                        {currentDistance.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">km</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">
                        {currentCalories}
                      </div>
                      <div className="text-xs text-slate-400">kcal</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">
                        {isTracking && sessionStartTime ? Math.round(sessionSteps / Math.max(getSessionDuration(), 1)) : 0}
                      </div>
                      <div className="text-xs text-slate-400">Tezlik</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievement */}
                {steps >= stepGoal.dailySteps && (
                  <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-xl">
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-green-400 mb-2">
                        Kunlik Qahramon!
                      </h3>
                      <p className="text-sm text-green-300">
                        Bugun {steps.toLocaleString()} qadamlar yurdingiz va maqsadingizga erishdingiz!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'week' && (
              <>
                {/* Weekly Stats Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-3">
                        <Footprints className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{avgSteps.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">O'rtacha qadamlar</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{completedDays}/7</div>
                      <div className="text-xs text-slate-400">Muvaffaq kunlar</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Chart */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Haftalik natijalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weekData.map((day, index) => {
                      const dayName = new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short' });
                      const isCompleted = day.steps >= stepGoal.dailySteps;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-300 w-8 text-sm">{dayName}</span>
                            <div className="w-24 bg-slate-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isCompleted 
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                }`}
                                style={{ width: `${Math.min((day.steps / stepGoal.dailySteps) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <div>
                              <p className="text-white font-semibold text-sm">{day.steps.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">{day.distance.toFixed(1)} km</p>
                            </div>
                            {isCompleted && (
                              <Trophy className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Weekly Summary */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Haftalik xulosa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-400">
                          {totalWeekSteps.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">Jami qadamlar</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          {totalDistance.toFixed(1)} km
                        </div>
                        <div className="text-xs text-slate-400">Jami masofa</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-400">
                          {totalCalories}
                        </div>
                        <div className="text-xs text-slate-400">Jami kaloriya</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">AI tahlili</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Bu hafta {completedDays} kun maqsadga erishdingiz. 
                        {completedDays >= 5 
                          ? " Ajoyib natija! Shu yo'lda davom eting." 
                          : " Keyingi hafta yanada yaxshi natijaga erishishingiz mumkin."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'goals' && (
              <>
                {/* Step Goals Settings */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Qadamlar maqsadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-slate-300 mb-3 block">Kunlik qadamlar maqsadi</Label>
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStepGoal(prev => ({ ...prev, dailySteps: Math.max(1000, prev.dailySteps - 1000) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{stepGoal.dailySteps.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">qadamlar</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStepGoal(prev => ({ ...prev, dailySteps: Math.min(50000, prev.dailySteps + 1000) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-3 block">Haftalik qadamlar maqsadi</Label>
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStepGoal(prev => ({ ...prev, weeklySteps: Math.max(10000, prev.weeklySteps - 5000) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{stepGoal.weeklySteps.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">qadamlar</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStepGoal(prev => ({ ...prev, weeklySteps: Math.min(300000, prev.weeklySteps + 5000) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                      onClick={() => {
                        hapticFeedback.notification('success');
                        showAlert('Maqsadlar saqlandi');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Maqsadlarni saqlash
                    </Button>
                  </CardContent>
                </Card>

                {/* Walking Tips */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Yurish bo'yicha maslahatlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Kuniga kamida 30 daqiqa yuring",
                      "Lift o'rniga zinapoyadan foydalaning",
                      "Qisqa masofalarni piyoda yuring",
                      "Ish vaqtida har soatda 5 daqiqa yuring",
                      "Mobil telefonda yurganda gaplashing",
                      "Erta tongda yoki kechqurun sayr qiling"
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-blue-400 font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-sm text-slate-300">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}