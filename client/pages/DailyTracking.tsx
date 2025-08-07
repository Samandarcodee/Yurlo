/**
 * Daily Tracking Dashboard
 * Comprehensive daily data collection interface
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Footprints, Droplets, Heart, Activity,
  TrendingUp, Calendar, Clock, Save, CheckCircle,
  Plus, Target, Award, Zap, Coffee, Apple,
  Bed, Weight, Smile, Frown, Meh, AlertCircle,
  Edit, BarChart3, Timer, FileText, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { useTelegram } from '@/hooks/use-telegram';
import { useI18n } from '@/contexts/I18nContext';
import DailyTrackingService, { DailyMetrics, WeeklySummary } from '@/services/daily-tracking-service';
import TelegramUserService from '@/services/telegram-user-service';

const MOOD_OPTIONS = [
  { value: 'terrible', label: 'Juda yomon', icon: '😣', color: 'text-red-500' },
  { value: 'bad', label: 'Yomon', icon: '😟', color: 'text-orange-500' },
  { value: 'okay', label: 'Normal', icon: '😐', color: 'text-yellow-500' },
  { value: 'good', label: 'Yaxshi', icon: '😊', color: 'text-green-500' },
  { value: 'excellent', label: 'Zo\'r', icon: '😄', color: 'text-green-600' }
];

const SLEEP_QUALITY_OPTIONS = [
  { value: 'poor', label: 'Yomon', icon: '😴', color: 'text-red-500' },
  { value: 'fair', label: 'O\'rtacha', icon: '😪', color: 'text-yellow-500' },
  { value: 'good', label: 'Yaxshi', icon: '😌', color: 'text-green-500' },
  { value: 'excellent', label: 'Mukammal', icon: '🥱', color: 'text-green-600' }
];

export default function DailyTracking() {
  const { user: telegramUser, hapticFeedback, showAlert, cloudStorage } = useTelegram();
  const { t } = useI18n();
  
  // Services
  const [trackingService] = useState(() => 
    DailyTrackingService.getInstance(TelegramUserService.getInstance(cloudStorage))
  );

  // Data states
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState('today');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [showSleepDialog, setShowSleepDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);

  // Form states
  const [tempWeight, setTempWeight] = useState<string>('');
  const [exerciseData, setExerciseData] = useState({
    type: '',
    duration: 30,
    intensity: 'moderate' as 'low' | 'moderate' | 'high',
    notes: ''
  });

  const telegramId = telegramUser?.id?.toString() || 'demo_user';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metrics, summary] = await Promise.all([
        trackingService.getTodayMetrics(telegramId),
        trackingService.getWeeklySummary(telegramId)
      ]);
      
      setTodayMetrics(metrics);
      setWeeklySummary(summary);
    } catch (error) {
      console.error('Error loading tracking data:', error);
      showAlert('Ma\'lumotlar yuklanmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = async (updates: Partial<DailyMetrics>) => {
    if (!todayMetrics) return;

    try {
      setSaving(true);
      const updated = { ...todayMetrics, ...updates };
      await trackingService.saveMetrics(telegramId, updated);
      setTodayMetrics(updated);
      hapticFeedback.notification('success');
    } catch (error) {
      console.error('Error updating metrics:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  const updateSleep = async (sleepData: DailyMetrics['sleep']) => {
    try {
      setSaving(true);
      await trackingService.updateSleepData(telegramId, sleepData);
      await loadData();
      setShowSleepDialog(false);
      hapticFeedback.notification('success');
    } catch (error) {
      console.error('Error updating sleep:', error);
      showAlert('Uyqu ma\'lumotlari saqlanmadi.');
    } finally {
      setSaving(false);
    }
  };

  const updateSteps = async (steps: number) => {
    try {
      await trackingService.updateStepsData(telegramId, { count: steps });
      await loadData();
      hapticFeedback.impact('light');
    } catch (error) {
      console.error('Error updating steps:', error);
    }
  };

  const updateWater = async (glasses: number) => {
    try {
      await trackingService.updateWaterIntake(telegramId, { glasses });
      await loadData();
      hapticFeedback.impact('light');
    } catch (error) {
      console.error('Error updating water:', error);
    }
  };

  const updateWeight = async () => {
    const weight = parseFloat(tempWeight);
    if (!weight || weight < 30 || weight > 300) {
      showAlert('Iltimos, to\'g\'ri vazn kiriting (30-300 kg).');
      return;
    }

    try {
      setSaving(true);
      await trackingService.updateWeight(telegramId, weight);
      await loadData();
      setShowWeightDialog(false);
      setTempWeight('');
      hapticFeedback.notification('success');
      showAlert('Vazn saqlandi!');
    } catch (error) {
      console.error('Error updating weight:', error);
      showAlert('Vazn saqlanmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = async () => {
    if (!exerciseData.type) {
      showAlert('Sport turini tanlang.');
      return;
    }

    try {
      setSaving(true);
      await trackingService.addExercise(telegramId, {
        type: exerciseData.type,
        duration: exerciseData.duration,
        intensity: exerciseData.intensity,
        notes: exerciseData.notes || undefined
      });
      
      await loadData();
      setShowExerciseDialog(false);
      setExerciseData({ type: '', duration: 30, intensity: 'moderate', notes: '' });
      hapticFeedback.notification('success');
      showAlert('Mashq qo\'shildi!');

      // Best-effort push notify
      try {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: telegramId, template: 'exercise_added', lang: (await (await import('@/contexts/UserContext')).useUser)?.().user?.language || 'uz' }),
        });
      } catch {}
    } catch (error) {
      console.error('Error adding exercise:', error);
      showAlert('Mashq qo\'shilmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-sm mx-4 theme-card shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Ma'lumotlar yuklanmoqda...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30">
      <div className="container-mobile min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('pages.daily.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('uz-UZ', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {todayMetrics && (
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {todayMetrics.dataCompleteness}%
                </div>
                <div className="text-xs text-muted-foreground">bajarildi</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Bugun</TabsTrigger>
              <TabsTrigger value="week">Hafta</TabsTrigger>
              <TabsTrigger value="trends">Trend</TabsTrigger>
            </TabsList>

            {/* Today Tab */}
            <TabsContent value="today" className="space-y-4">
              {todayMetrics && (
                <>
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => setShowWeightDialog(true)}
                    >
                      <Weight className="w-6 h-6 text-primary" />
                      <span className="text-sm">Vazn</span>
                      <span className="text-xs text-muted-foreground">
                        {todayMetrics.weight ? `${todayMetrics.weight} kg` : 'Kiritilmagan'}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => setShowSleepDialog(true)}
                    >
                      <Moon className="w-6 h-6 text-blue-500" />
                      <span className="text-sm">Uyqu</span>
                      <span className="text-xs text-muted-foreground">
                        {todayMetrics.sleep.hoursSlept ? `${todayMetrics.sleep.hoursSlept.toFixed(1)} soat` : 'Kiritilmagan'}
                      </span>
                    </Button>
                  </div>

                  {/* Mood & Energy */}
                  <Card className="theme-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="w-5 h-5" />
                        <span>Kayfiyat va energiya</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mood */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Kayfiyat</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {MOOD_OPTIONS.map((mood) => (
                            <Button
                              key={mood.value}
                              variant={todayMetrics.mood === mood.value ? 'default' : 'outline'}
                              size="sm"
                              className="p-2 h-auto flex flex-col items-center space-y-1"
                              onClick={() => updateMetrics({ mood: mood.value as any })}
                            >
                              <span className="text-lg">{mood.icon}</span>
                              <span className="text-xs">{mood.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Energy */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Energiya darajasi: {todayMetrics.energy}/5
                        </Label>
                        <Slider
                          value={[todayMetrics.energy]}
                          onValueChange={([value]) => updateMetrics({ energy: value as any })}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Stress */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Stress darajasi: {todayMetrics.stress}/5
                        </Label>
                        <Slider
                          value={[todayMetrics.stress]}
                          onValueChange={([value]) => updateMetrics({ stress: value as any })}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Tracking */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Steps */}
                    <Card className="theme-card">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Footprints className="w-5 h-5" />
                            <span>Qadamlar</span>
                          </div>
                          <Badge variant="secondary">
                            {todayMetrics.steps.count}/{todayMetrics.steps.target}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress 
                            value={(todayMetrics.steps.count / todayMetrics.steps.target) * 100} 
                            className="h-3"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSteps(todayMetrics.steps.count + 1000)}
                            >
                              +1000
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSteps(todayMetrics.steps.count + 5000)}
                            >
                              +5000
                            </Button>
                            <Input
                              placeholder="Qadamlar"
                              type="number"
                              onBlur={(e) => {
                                const steps = parseInt(e.target.value);
                                if (steps > 0) updateSteps(steps);
                                e.target.value = '';
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Water */}
                    <Card className="theme-card">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Droplets className="w-5 h-5" />
                            <span>Suv</span>
                          </div>
                          <Badge variant="secondary">
                            {todayMetrics.water.glasses}/{todayMetrics.water.target} stakan
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress 
                            value={(todayMetrics.water.glasses / todayMetrics.water.target) * 100} 
                            className="h-3"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => updateWater(todayMetrics.water.glasses + 1)}
                              disabled={todayMetrics.water.glasses >= todayMetrics.water.target}
                            >
                              +1 stakan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWater(Math.max(0, todayMetrics.water.glasses - 1))}
                              disabled={todayMetrics.water.glasses <= 0}
                            >
                              -1 stakan
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exercise */}
                    <Card className="theme-card">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Jismoniy mashqlar</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowExerciseDialog(true)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {todayMetrics.exercise && todayMetrics.exercise.length > 0 ? (
                          <div className="space-y-2">
                            {todayMetrics.exercise.map((ex, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                <div>
                                  <div className="font-medium">{ex.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {ex.duration} daqiqa • {ex.intensity}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {ex.caloriesBurned || Math.round(ex.duration * 5)} kal
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Bugun hali mashq qilmadingiz
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Week Tab */}
            <TabsContent value="week" className="space-y-4">
              {weeklySummary && (
                <WeeklySummaryComponent summary={weeklySummary} />
              )}
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <TrendsComponent telegramId={telegramId} trackingService={trackingService} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <SleepDialog
          open={showSleepDialog}
          onClose={() => setShowSleepDialog(false)}
          onSave={updateSleep}
          currentSleep={todayMetrics?.sleep}
          saving={saving}
        />

        <ExerciseDialog
          open={showExerciseDialog}
          onClose={() => setShowExerciseDialog(false)}
          onSave={addExercise}
          exerciseData={exerciseData}
          onChange={setExerciseData}
          saving={saving}
        />

        <WeightDialog
          open={showWeightDialog}
          onClose={() => setShowWeightDialog(false)}
          onSave={updateWeight}
          weight={tempWeight}
          onChange={setTempWeight}
          saving={saving}
        />
      </div>
    </div>
  );
}

// === HELPER COMPONENTS === //

const WeeklySummaryComponent: React.FC<{ summary: WeeklySummary }> = ({ summary }) => {
  return (
    <div className="space-y-4">
      <Card className="theme-card">
        <CardHeader>
          <CardTitle>Haftalik xulosa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.averageSteps.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">O'rtacha qadamlar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{summary.averageSleep.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">O'rtacha uyqu (soat)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{summary.daysWithGoalsMet}</div>
              <div className="text-sm text-muted-foreground">Maqsadga erishgan kunlar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{summary.totalWaterGlasses}</div>
              <div className="text-sm text-muted-foreground">Jami suv (stakan)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary.achievements.length > 0 && (
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Yutuqlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary.improvementAreas.length > 0 && (
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Yaxshilanish sohalari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const TrendsComponent: React.FC<{
  telegramId: string;
  trackingService: DailyTrackingService;
}> = ({ telegramId, trackingService }) => {
  return (
    <Card className="theme-card">
      <CardHeader>
        <CardTitle>Tendentsiyalar</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-8">
          Tendentsiyalar tahlili tez orada...
        </p>
      </CardContent>
    </Card>
  );
};

// === DIALOG COMPONENTS === //

const SleepDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (sleep: DailyMetrics['sleep']) => void;
  currentSleep?: DailyMetrics['sleep'];
  saving: boolean;
}> = ({ open, onClose, onSave, currentSleep, saving }) => {
  const [sleepData, setSleepData] = useState({
    bedtime: currentSleep?.bedtime || '',
    wakeTime: currentSleep?.wakeTime || '',
    quality: currentSleep?.quality || 'fair' as const,
    notes: currentSleep?.notes || ''
  });

  const handleSave = () => {
    onSave(sleepData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uyqu ma'lumotlari</DialogTitle>
          <DialogDescription>
            Kechagi uyqu haqida ma'lumot kiriting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Yotish vaqti</Label>
              <Input
                type="time"
                value={sleepData.bedtime}
                onChange={(e) => setSleepData({ ...sleepData, bedtime: e.target.value })}
              />
            </div>
            <div>
              <Label>Uyg'onish vaqti</Label>
              <Input
                type="time"
                value={sleepData.wakeTime}
                onChange={(e) => setSleepData({ ...sleepData, wakeTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Uyqu sifati</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {SLEEP_QUALITY_OPTIONS.map((quality) => (
                <Button
                  key={quality.value}
                  variant={sleepData.quality === quality.value ? 'default' : 'outline'}
                  size="sm"
                  className="p-2 h-auto flex flex-col items-center space-y-1"
                  onClick={() => setSleepData({ ...sleepData, quality: quality.value as any })}
                >
                  <span className="text-lg">{quality.icon}</span>
                  <span className="text-xs">{quality.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Izoh</Label>
            <Textarea
              placeholder="Uyqu haqida qo'shimcha ma'lumot..."
              value={sleepData.notes}
              onChange={(e) => setSleepData({ ...sleepData, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ExerciseDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  exerciseData: any;
  onChange: (data: any) => void;
  saving: boolean;
}> = ({ open, onClose, onSave, exerciseData, onChange, saving }) => {
  const exerciseTypes = [
    'Yugurish', 'Yurish', 'Velosiped', 'Suzish', 'Yoga', 'Fitnes',
    'Futbol', 'Basketbol', 'Tennis', 'Boks', 'Gymnastika', 'Boshqa'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jismoniy mashq qo'shish</DialogTitle>
          <DialogDescription>
            Bugun qilgan mashqingiz haqida ma'lumot kiriting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Sport turi</Label>
            <Select value={exerciseData.type} onValueChange={(value) => onChange({ ...exerciseData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sport turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Davomiyligi (daqiqa): {exerciseData.duration}</Label>
            <Slider
              value={[exerciseData.duration]}
              onValueChange={([value]) => onChange({ ...exerciseData, duration: value })}
              max={240}
              min={5}
              step={5}
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label>Intensivlik</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: 'low', label: 'Past', color: 'text-green-500' },
                { value: 'moderate', label: 'O\'rtacha', color: 'text-yellow-500' },
                { value: 'high', label: 'Yuqori', color: 'text-red-500' }
              ].map((intensity) => (
                <Button
                  key={intensity.value}
                  variant={exerciseData.intensity === intensity.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ ...exerciseData, intensity: intensity.value })}
                >
                  {intensity.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Izoh</Label>
            <Textarea
              placeholder="Mashq haqida qo'shimcha ma'lumot..."
              value={exerciseData.notes}
              onChange={(e) => onChange({ ...exerciseData, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Bekor qilish
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const WeightDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  weight: string;
  onChange: (weight: string) => void;
  saving: boolean;
}> = ({ open, onClose, onSave, weight, onChange, saving }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vazn kiritish</DialogTitle>
          <DialogDescription>
            Bugungi vaznni kiriting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Vazn (kg)</Label>
            <Input
              type="number"
              placeholder="70.5"
              value={weight}
              onChange={(e) => onChange(e.target.value)}
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Bekor qilish
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};