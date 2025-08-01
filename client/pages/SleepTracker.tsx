import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp, 
  Target, 
  Star, 
  Calendar,
  BarChart3,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { useTelegram } from '@/hooks/use-telegram';
import {
  getSleepGoals,
  updateSleepGoals,
  getTodaySleep,
  updateSleepSession,
  getSleepHistory,
  getSleepInsights,
  addSampleSleepData,
  isBedtimeReminder,
  getSleepQualityDescription,
  calculateSleepScore,
  type SleepSession,
  type SleepGoals,
  type SleepInsights,
} from '@/utils/sleepTracking';

// Quality Rating Component
interface QualityRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const QualityRating: React.FC<QualityRatingProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              rating <= value
                ? 'bg-yellow-400 border-yellow-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Star className={`w-5 h-5 mx-auto ${rating <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">
        {getSleepQualityDescription(value)}
      </p>
    </div>
  );
};

// Sleep Chart Component (simplified)
interface SleepChartProps {
  history: SleepSession[];
}

const SleepChart: React.FC<SleepChartProps> = ({ history }) => {
  const last7Days = history.slice(0, 7).reverse();
  
  if (last7Days.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p>Ma'lumotlar yo'q</p>
      </div>
    );
  }
  
  const maxDuration = Math.max(...last7Days.map(s => s.sleepDuration));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between h-24 space-x-1">
        {last7Days.map((session, index) => {
          const height = (session.sleepDuration / maxDuration) * 100;
          const qualityColor = session.sleepQuality >= 4 ? 'bg-green-500' 
                             : session.sleepQuality >= 3 ? 'bg-yellow-500' 
                             : 'bg-red-500';
          
          return (
            <div key={session.id} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${qualityColor} rounded-t transition-all duration-500`}
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0h</span>
        <span>{maxDuration.toFixed(1)}h</span>
      </div>
    </div>
  );
};

export default function SleepTracker() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();
  const [activeTab, setActiveTab] = useState<'log' | 'insights' | 'goals'>('log');
  const [isLoading, setIsLoading] = useState(true);
  const [todaySleep, setTodaySleep] = useState<SleepSession | null>(null);
  const [sleepGoals, setSleepGoals] = useState<SleepGoals | null>(null);
  const [sleepInsights, setSleepInsights] = useState<SleepInsights | null>(null);
  const [sleepHistory, setSleepHistory] = useState<SleepSession[]>([]);
  
  // Form states
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [mood, setMood] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [timesToWakeUp, setTimesToWakeUp] = useState(0);
  const [fellAsleepTime, setFellAsleepTime] = useState(15);
  const [notes, setNotes] = useState('');
  
  // Goals form states
  const [targetBedTime, setTargetBedTime] = useState('');
  const [targetWakeTime, setTargetWakeTime] = useState('');
  const [targetDuration, setTargetDuration] = useState(8);
  
  const telegramId = telegramUser?.id?.toString() || "demo_user_123";
  
  // Load data on component mount
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      try {
        // Add sample data if needed
        addSampleSleepData(telegramId);
        
        // Load sleep data
        const today = getTodaySleep(telegramId);
        const goals = getSleepGoals(telegramId);
        const insights = getSleepInsights(telegramId);
        const history = getSleepHistory(telegramId, 30);
        
        setTodaySleep(today);
        setSleepGoals(goals);
        setSleepInsights(insights);
        setSleepHistory(history);
        
        // Initialize form with existing data or defaults
        if (today) {
          setBedTime(today.bedTime);
          setWakeTime(today.wakeTime);
          setSleepQuality(today.sleepQuality);
          setMood(today.mood);
          setEnergyLevel(today.energyLevel);
          setTimesToWakeUp(today.timesToWakeUp);
          setFellAsleepTime(today.fellAsleepTime);
          setNotes(today.notes || '');
        } else {
          setBedTime(goals.targetBedTime);
          setWakeTime(goals.targetWakeTime);
        }
        
        // Initialize goals form
        setTargetBedTime(goals.targetBedTime);
        setTargetWakeTime(goals.targetWakeTime);
        setTargetDuration(goals.targetDuration);
        
      } catch (error) {
        console.error('Error loading sleep data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, telegramId]);
  
  // Calculate today's sleep score
  const todaySleepScore = useMemo(() => {
    if (!todaySleep || !sleepGoals) return 0;
    return calculateSleepScore(todaySleep, sleepGoals);
  }, [todaySleep, sleepGoals]);
  
  // Check for bedtime reminder
  const showBedtimeReminder = useMemo(() => {
    return isBedtimeReminder(telegramId);
  }, [telegramId]);
  
  // Handle sleep session save
  const handleSaveSleepSession = () => {
    try {
      const sessionData = {
        bedTime,
        wakeTime,
        sleepQuality: sleepQuality as 1 | 2 | 3 | 4 | 5,
        mood: mood as 1 | 2 | 3 | 4 | 5,
        energyLevel: energyLevel as 1 | 2 | 3 | 4 | 5,
        timesToWakeUp,
        fellAsleepTime,
        notes,
      };
      
      const updated = updateSleepSession(telegramId, sessionData);
      setTodaySleep(updated);
      
      // Refresh insights
      const insights = getSleepInsights(telegramId);
      setSleepInsights(insights);
      
      // Show success message (you could add a toast here)
      alert('Uyqu ma\'lumotlari saqlandi!');
      
    } catch (error) {
      console.error('Error saving sleep session:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };
  
  // Handle goals save
  const handleSaveGoals = () => {
    try {
      const goalsData = {
        targetBedTime,
        targetWakeTime,
        targetDuration,
        consistencyGoal: 7,
      };
      
      const updated = updateSleepGoals(telegramId, goalsData);
      setSleepGoals(updated);
      
      alert('Uyqu maqsadlari saqlandi!');
      
    } catch (error) {
      console.error('Error saving sleep goals:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Uyqu ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Uyqu Nazorati</h1>
                <p className="text-indigo-100 text-sm">
                  {new Date().toLocaleDateString('uz-UZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                ←
              </Button>
            </Link>
          </div>
          
          {/* Sleep Score */}
          {todaySleep && (
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-indigo-100">Bugungi uyqu bahosi</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-none">
                  {todaySleepScore}/100
                </Badge>
              </div>
              <Progress value={todaySleepScore} className="h-2 bg-white/20" />
              <div className="flex items-center justify-between mt-2 text-xs text-indigo-100">
                <span>{todaySleep.sleepDuration.toFixed(1)}h uyqu</span>
                <span>{getSleepQualityDescription(todaySleep.sleepQuality)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Bedtime Reminder */}
        {showBedtimeReminder && (
          <div className="mx-4 -mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Uyqu vaqti yaqinlashdi!</h4>
                <p className="text-sm opacity-90">
                  Maqsadli uyqu vaqtingizgacha 30 daqiqa qoldi. Tayyorgarlik ko'ring.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 mx-4 mt-4 rounded-2xl p-1">
          {[
            { id: 'log', label: 'Yozish', icon: Plus },
            { id: 'insights', label: 'Tahlil', icon: BarChart3 },
            { id: 'goals', label: 'Maqsad', icon: Target },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="p-4 pb-20">
          {/* Log Tab */}
          {activeTab === 'log' && (
            <div className="space-y-6">
              {/* Sleep Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Uyqu Vaqtlari</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedTime">Yotish vaqti</Label>
                      <Input
                        id="bedTime"
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wakeTime">Turish vaqti</Label>
                      <Input
                        id="wakeTime"
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {bedTime && wakeTime && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Uyqu davomiyligi:</span>
                        <span className="font-semibold text-blue-800">
                          {(() => {
                            const bed = new Date(`2000-01-01T${bedTime}`);
                            const wake = new Date(`2000-01-${bedTime > wakeTime ? '02' : '01'}T${wakeTime}`);
                            const duration = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
                            return `${duration.toFixed(1)} soat`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Sleep Quality */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Uyqu Sifati</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QualityRating 
                    value={sleepQuality} 
                    onChange={setSleepQuality} 
                    label="Uyqu sifati"
                  />
                  <QualityRating 
                    value={mood} 
                    onChange={setMood} 
                    label="Ertalabki kayfiyat"
                  />
                  <QualityRating 
                    value={energyLevel} 
                    onChange={setEnergyLevel} 
                    label="Energiya darajasi"
                  />
                </CardContent>
              </Card>
              
              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Qo'shimcha Ma'lumotlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wakeUps">Uyg'onish soni</Label>
                      <Input
                        id="wakeUps"
                        type="number"
                        min="0"
                        max="10"
                        value={timesToWakeUp}
                        onChange={(e) => setTimesToWakeUp(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fallAsleep">Uxlash vaqti (daqiqa)</Label>
                      <Input
                        id="fallAsleep"
                        type="number"
                        min="1"
                        max="120"
                        value={fellAsleepTime}
                        onChange={(e) => setFellAsleepTime(parseInt(e.target.value) || 15)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Izohlar</Label>
                    <Textarea
                      id="notes"
                      placeholder="Uyqu haqida izoh yozing..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                onClick={handleSaveSleepSession}
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Saqlash
              </Button>
            </div>
          )}
          
          {/* Insights Tab */}
          {activeTab === 'insights' && sleepInsights && (
            <div className="space-y-6">
              {/* Sleep Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>So'nggi 7 Kun</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SleepChart history={sleepHistory} />
                </CardContent>
              </Card>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {sleepInsights.averageDuration.toFixed(1)}h
                      </div>
                      <div className="text-xs text-gray-500">O'rtacha uyqu</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {sleepInsights.averageQuality.toFixed(1)}/5
                      </div>
                      <div className="text-xs text-gray-500">O'rtacha sifat</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {sleepInsights.consistencyScore}%
                      </div>
                      <div className="text-xs text-gray-500">Barqarorlik</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {sleepInsights.averageFallAsleepTime}m
                      </div>
                      <div className="text-xs text-gray-500">Uxlash vaqti</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Tendensiyalar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uyqu davomiyligi</span>
                    <Badge variant={
                      sleepInsights.trends.durationTrend === 'improving' ? 'default' :
                      sleepInsights.trends.durationTrend === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {sleepInsights.trends.durationTrend === 'improving' ? '📈 Yaxshilanmoqda' :
                       sleepInsights.trends.durationTrend === 'declining' ? '📉 Pasaymoqda' : '➡️ Barqaror'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uyqu sifati</span>
                    <Badge variant={
                      sleepInsights.trends.qualityTrend === 'improving' ? 'default' :
                      sleepInsights.trends.qualityTrend === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {sleepInsights.trends.qualityTrend === 'improving' ? '📈 Yaxshilanmoqda' :
                       sleepInsights.trends.qualityTrend === 'declining' ? '📉 Pasaymoqda' : '➡️ Barqaror'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Barqarorlik</span>
                    <Badge variant={
                      sleepInsights.trends.consistencyTrend === 'improving' ? 'default' :
                      sleepInsights.trends.consistencyTrend === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {sleepInsights.trends.consistencyTrend === 'improving' ? '📈 Yaxshilanmoqda' :
                       sleepInsights.trends.consistencyTrend === 'declining' ? '📉 Pasaymoqda' : '➡️ Barqaror'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>AI Tavsiyalar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sleepInsights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800 flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Goals Tab */}
          {activeTab === 'goals' && sleepGoals && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Uyqu Maqsadlari</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetBed">Maqsadli yotish vaqti</Label>
                      <Input
                        id="targetBed"
                        type="time"
                        value={targetBedTime}
                        onChange={(e) => setTargetBedTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetWake">Maqsadli turish vaqti</Label>
                      <Input
                        id="targetWake"
                        type="time"
                        value={targetWakeTime}
                        onChange={(e) => setTargetWakeTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetDuration">Maqsadli uyqu davomiyligi (soat)</Label>
                    <Input
                      id="targetDuration"
                      type="number"
                      min="4"
                      max="12"
                      step="0.5"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(parseFloat(e.target.value) || 8)}
                      className="mt-1"
                    />
                  </div>
                  
                  {targetBedTime && targetWakeTime && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Maqsadli jadval:</span>
                        <span className="font-semibold text-green-800">
                          {targetBedTime} → {targetWakeTime}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Progress towards goals */}
              {sleepInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Maqsadga Jarayon</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Uyqu davomiyligi</span>
                        <span className="text-sm font-semibold">
                          {sleepInsights.averageDuration.toFixed(1)}h / {targetDuration}h
                        </span>
                      </div>
                      <Progress value={(sleepInsights.averageDuration / targetDuration) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Uyqu sifati</span>
                        <span className="text-sm font-semibold">
                          {sleepInsights.averageQuality.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <Progress value={(sleepInsights.averageQuality / 5) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Jadval barqarorligi</span>
                        <span className="text-sm font-semibold">{sleepInsights.consistencyScore}%</span>
                      </div>
                      <Progress value={sleepInsights.consistencyScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button 
                onClick={handleSaveGoals}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Maqsadlarni Saqlash
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}