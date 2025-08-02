import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTelegram } from "@/hooks/use-telegram";
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Star,
  Bed,
  Timer,
  Play,
  Pause,
  Target,
  Zap,
  Award,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  Brain,
} from "lucide-react";

interface SleepSession {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: number; // 1-10
  notes?: string;
}

interface SleepGoal {
  targetHours: number;
  bedTimeTarget: string;
  wakeTimeTarget: string;
}

export default function EnhancedSleepTracker() {
  const { hapticFeedback, showAlert } = useTelegram();
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'goals'>('today');

  const [sleepGoal, setSleepGoal] = useState<SleepGoal>({
    targetHours: 8,
    bedTimeTarget: "23:00",
    wakeTimeTarget: "07:00"
  });

  const [todaySleep, setTodaySleep] = useState<SleepSession | null>(null);

  // Mock sleep data for the week
  const weekSleepData: SleepSession[] = [
    { id: '1', date: '2024-01-29', bedTime: "23:15", wakeTime: "07:30", duration: 8.25, quality: 8 },
    { id: '2', date: '2024-01-30', bedTime: "22:45", wakeTime: "07:00", duration: 8.25, quality: 9 },
    { id: '3', date: '2024-01-31', bedTime: "23:30", wakeTime: "07:15", duration: 7.75, quality: 7 },
    { id: '4', date: '2024-02-01', bedTime: "22:30", wakeTime: "06:45", duration: 8.25, quality: 9 },
    { id: '5', date: '2024-02-02', bedTime: "23:00", wakeTime: "07:30", duration: 8.5, quality: 8 },
    { id: '6', date: '2024-02-03', bedTime: "00:15", wakeTime: "08:45", duration: 8.5, quality: 6 },
    { id: '7', date: '2024-02-04', bedTime: "23:00", wakeTime: "07:00", duration: 8.0, quality: 9 },
  ];

  const avgSleep = weekSleepData.reduce((acc, day) => acc + day.duration, 0) / weekSleepData.length;
  const avgQuality = weekSleepData.reduce((acc, day) => acc + day.quality, 0) / weekSleepData.length;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load today's sleep data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`sleep_${today}`);
    if (storedData) {
      setTodaySleep(JSON.parse(storedData));
    }
  }, []);

  const startSleepTracking = () => {
    setIsTracking(true);
    setSessionStartTime(new Date());
    hapticFeedback.impact('medium');
    showAlert('Uyqu kuzatuvi boshlandi');
  };

  const stopSleepTracking = () => {
    if (!sessionStartTime) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60);
    
    const newSession: SleepSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bedTime: sessionStartTime.toTimeString().slice(0, 5),
      wakeTime: endTime.toTimeString().slice(0, 5),
      duration: duration,
      quality: 8, // Default quality
    };

    setTodaySleep(newSession);
    localStorage.setItem(`sleep_${newSession.date}`, JSON.stringify(newSession));
    
    setIsTracking(false);
    setSessionStartTime(null);
    hapticFeedback.notification('success');
    showAlert(`Uyqu tugadi: ${duration.toFixed(1)} soat`);
  };

  const updateSleepQuality = (quality: number) => {
    if (!todaySleep) return;
    
    const updatedSleep = { ...todaySleep, quality };
    setTodaySleep(updatedSleep);
    localStorage.setItem(`sleep_${updatedSleep.date}`, JSON.stringify(updatedSleep));
    hapticFeedback.impact('light');
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getSleepQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-400';
    if (quality >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSleepQualityLabel = (quality: number) => {
    if (quality >= 9) return 'Mukammal';
    if (quality >= 8) return 'Yaxshi';
    if (quality >= 6) return 'O\'rtacha';
    if (quality >= 4) return 'Yomon';
    return 'Juda yomon';
  };

  const getCurrentSessionDuration = () => {
    if (!sessionStartTime) return 0;
    return (currentTime.getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60);
  };

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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Uyqu Tracker</h1>
            <p className="text-slate-300">Sifatli uyqu - sog'lik kaliti</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800/50 rounded-xl">
            {(['today', 'week', 'goals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white shadow-lg'
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
                {/* Sleep Tracking Control */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      {isTracking ? (
                        <>
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Moon className="w-12 h-12 text-white" />
                            <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping"></div>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Uyquda</h3>
                          <p className="text-2xl font-bold text-purple-400 mb-4">
                            {formatDuration(getCurrentSessionDuration())}
                          </p>
                          <Button
                            onClick={stopSleepTracking}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Uyg'onish
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bed className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Uyqu kuzatuvi</h3>
                          <p className="text-slate-400 mb-4">Uyquni kuzatishni boshlang</p>
                          <Button
                            onClick={startSleepTracking}
                            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-8 py-3"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Uxlash
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Sleep Data */}
                {todaySleep && (
                  <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        Bugungi uyqu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {formatDuration(todaySleep.duration)}
                        </div>
                        <p className="text-slate-300">Uxlagan vaqt</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Yotgan</p>
                          <p className="text-white font-semibold">{todaySleep.bedTime}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <Sun className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Uyg'ongan</p>
                          <p className="text-white font-semibold">{todaySleep.wakeTime}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-slate-300">Uyqu sifati</span>
                          <Badge className={`${getSleepQualityColor(todaySleep.quality)} bg-transparent border border-current`}>
                            {getSleepQualityLabel(todaySleep.quality)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => updateSleepQuality(rating)}
                              className={`w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200 ${
                                rating <= todaySleep.quality
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                        
                        <Progress value={todaySleep.quality * 10} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sleep Goal Progress */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Kunlik maqsad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-white">{sleepGoal.targetHours} soat</p>
                        <p className="text-slate-400">Maqsad</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Erishish</p>
                        <p className={`text-lg font-semibold ${
                          todaySleep 
                            ? todaySleep.duration >= sleepGoal.targetHours ? 'text-green-400' : 'text-yellow-400'
                            : 'text-slate-400'
                        }`}>
                          {todaySleep ? Math.round((todaySleep.duration / sleepGoal.targetHours) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={todaySleep ? Math.min((todaySleep.duration / sleepGoal.targetHours) * 100, 100) : 0} 
                      className="h-2" 
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'week' && (
              <>
                {/* Weekly Stats Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{avgSleep.toFixed(1)}h</div>
                      <div className="text-xs text-slate-400">O'rtacha uyqu</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/90 border-slate-700/50">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{avgQuality.toFixed(1)}</div>
                      <div className="text-xs text-slate-400">O'rtacha sifat</div>
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
                    {weekSleepData.map((day, index) => {
                      const dayName = new Date(day.date).toLocaleDateString('uz-UZ', { weekday: 'short' });
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-300 w-8 text-sm">{dayName}</span>
                            <div className="w-24 bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((day.duration / 10) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold text-sm">{formatDuration(day.duration)}</p>
                            <p className={`text-xs ${getSleepQualityColor(day.quality)}`}>
                              {day.quality}/10
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-400" />
                      AI tahlili
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Yaxshi natija</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Bu hafta uyqu sifatingiz 85% yaxshilandi. Muntazam rejimni saqlang!
                      </p>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Tavsiya</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        22:30 dan erta yotishga harakat qiling. Bu uyqu sifatini oshiradi.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'goals' && (
              <>
                {/* Sleep Goals Settings */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Uyqu maqsadlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-slate-300 mb-3 block">Kunlik uyqu maqsadi</Label>
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSleepGoal(prev => ({ ...prev, targetHours: Math.max(6, prev.targetHours - 0.5) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{sleepGoal.targetHours}h</div>
                          <div className="text-xs text-slate-400">Maqsad</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSleepGoal(prev => ({ ...prev, targetHours: Math.min(12, prev.targetHours + 0.5) }))}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Yotish vaqti</Label>
                        <Input
                          type="time"
                          value={sleepGoal.bedTimeTarget}
                          onChange={(e) => setSleepGoal(prev => ({ ...prev, bedTimeTarget: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Uyg'onish vaqti</Label>
                        <Input
                          type="time"
                          value={sleepGoal.wakeTimeTarget}
                          onChange={(e) => setSleepGoal(prev => ({ ...prev, wakeTimeTarget: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white mt-2"
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
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

                {/* Sleep Tips */}
                <Card className="bg-slate-800/90 border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Uyqu bo'yicha maslahatlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Har kuni bir xil vaqtda yoting va uyg'oning",
                      "Uxlashdan 2 soat oldin ovqat iste'mol qilmang",
                      "Xona haroratini 18-22°C oralig'ida saqlang",
                      "Uxlashdan oldin telefon va kompyuter ishlatmang",
                      "Kunduzi 20-30 daqiqalik quyosh nuri oling"
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-purple-400 font-semibold">{index + 1}</span>
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