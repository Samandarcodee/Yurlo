import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Droplets,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Calendar,
  BarChart,
  Lightbulb,
  Settings,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import {
  getTodayWater,
  addWaterEntry,
  getWaterGoals,
  updateWaterGoals,
  getWaterInsights,
  getWaterHistory,
  addSampleWaterData,
  calculateWaterGoal,
  QUICK_WATER_AMOUNTS,
  WATER_TYPES,
  createWaterReminders,
  WaterSession,
  WaterGoals,
  WaterInsights,
  WaterEntry,
} from "@/utils/waterTracking";

export default function WaterTracker() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();

  const [todayWater, setTodayWater] = useState<WaterSession | null>(null);
  const [waterGoals, setWaterGoals] = useState<WaterGoals | null>(null);
  const [insights, setInsights] = useState<WaterInsights | null>(null);
  const [history, setHistory] = useState<WaterSession[]>([]);

  // Quick add states
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<
    "water" | "tea" | "coffee" | "juice" | "smoothie" | "other"
  >("water");
  const [notes, setNotes] = useState("");

  // Goals editing states
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState<WaterGoals | null>(null);

  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  useEffect(() => {
    if (user) {
      // Initialize data
      const waterGoal = calculateWaterGoal(user);
      addSampleWaterData(telegramId, waterGoal);

      // Load today's data
      const today = getTodayWater(telegramId);
      setTodayWater(today);

      // Load goals
      const goals = getWaterGoals(telegramId);
      setWaterGoals(goals);
      setTempGoals(goals);

      // Load insights
      const insightsData = getWaterInsights(telegramId);
      setInsights(insightsData);

      // Load history
      const historyData = getWaterHistory(telegramId, 7);
      setHistory(historyData);

      // Create reminders
      createWaterReminders(telegramId);
    }
  }, [user, telegramId]);

  const handleAddWater = (
    amount: number,
    type = selectedType,
    temperature: "cold" | "room" | "warm" = "room",
  ) => {
    const updated = addWaterEntry(
      telegramId,
      amount,
      type,
      temperature,
      notes.trim() || undefined,
    );
    setTodayWater(updated);
    setNotes("");

    // Refresh insights
    const newInsights = getWaterInsights(telegramId);
    setInsights(newInsights);

    // Notify if goal reached (respects user setting)
    if (updated.goalReached) {
      try {
        const enabled = localStorage.getItem(`notif_water_${telegramId}`);
        if (enabled === null || enabled === 'true') {
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramId, template: 'water_goal' }),
          });
        }
      } catch {}
    }
  };

  const handleUpdateGoals = () => {
    if (tempGoals) {
      const updated = updateWaterGoals(telegramId, tempGoals);
      setWaterGoals(updated);
      setIsEditingGoals(false);
    }
  };

  const todayProgress = useMemo(() => {
    if (!todayWater) return 0;
    return Math.round((todayWater.totalIntake / todayWater.goal) * 100);
  }, [todayWater]);

  const getHydrationLevel = (progress: number) => {
    if (progress >= 100)
      return {
        label: "A'lo",
        color: "bg-green-100 text-green-800",
        icon: "🌟",
      };
    if (progress >= 80)
      return {
        label: "Yaxshi",
        color: "bg-blue-100 text-blue-800",
        icon: "💧",
      };
    if (progress >= 60)
      return {
        label: "O'rtacha",
        color: "bg-yellow-100 text-yellow-800",
        icon: "⚡",
      };
    return { label: "Kam", color: "bg-red-100 text-red-800", icon: "⚠️" };
  };

  const hydrationStatus = getHydrationLevel(todayProgress);

  if (!todayWater || !waterGoals || !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pb-20">
      <div className="safe-area-top bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">
                Suv Tracker
              </span>
            </Link>
            <Badge variant="secondary" className={hydrationStatus.color}>
              {hydrationStatus.icon} {hydrationStatus.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Today's Progress */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <Droplets className="h-16 w-16 mx-auto mb-2 opacity-90" />
                <h2 className="text-2xl font-bold">
                  {todayWater.totalIntake.toFixed(1)} / {todayWater.goal} stakan
                </h2>
                <p className="text-blue-100">Bugungi suv iste'moli</p>
              </div>

              <div className="relative">
                <Progress
                  value={todayProgress}
                  className="h-4 bg-blue-400 [&>*]:bg-white"
                />
                <div className="flex justify-between text-sm mt-2 text-blue-100">
                  <span>0</span>
                  <span className="font-semibold">{todayProgress}%</span>
                  <span>{todayWater.goal}</span>
                </div>
              </div>

              {todayWater.goalReached && (
                <div className="mt-4 p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-medium">
                    Bugungi maqsad bajarildi! 🎉
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="log" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-2xl bg-white shadow-md">
            <TabsTrigger value="log" className="rounded-xl">
              Log
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl">
              Tarix
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl">
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Log Tab */}
          <TabsContent value="log" className="space-y-4">
            {/* Quick Add */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span>Suv qo'shish</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Miqdor (stakan)
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_WATER_AMOUNTS.map((item) => (
                      <button
                        key={item.amount}
                        onClick={() => setSelectedAmount(item.amount)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedAmount === item.amount
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-xl mb-1">{item.icon}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Slider
                      value={[selectedAmount]}
                      onValueChange={(value) => setSelectedAmount(value[0])}
                      max={3}
                      min={0.25}
                      step={0.25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.25</span>
                      <span className="font-medium">
                        {selectedAmount} stakan
                      </span>
                      <span>3.0</span>
                    </div>
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Ichimlik turi
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {WATER_TYPES.map((item) => (
                      <button
                        key={item.type}
                        onClick={() => setSelectedType(item.type)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedType === item.type
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-lg mb-1">{item.icon}</div>
                        <div className="text-xs font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label
                    htmlFor="notes"
                    className="text-sm font-medium text-gray-700"
                  >
                    Izoh (ixtiyoriy)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masalan: Limon bilan, issiq..."
                    className="mt-1 h-20"
                  />
                </div>

                <Button
                  onClick={() => handleAddWater(selectedAmount)}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {selectedAmount} stakan qo'shish
                </Button>
              </CardContent>
            </Card>

            {/* Today's Entries */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Bugungi yozuvlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayWater.entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Hali hech qanday suv qo'shilmagan</p>
                    <p className="text-sm">
                      Yuqoridan birinchi bo'lakni qo'shing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayWater.entries
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime(),
                      )
                      .map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {WATER_TYPES.find((t) => t.type === entry.type)
                                ?.icon || "💧"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {entry.amount} stakan
                              </p>
                              <p className="text-sm text-gray-500">
                                {
                                  WATER_TYPES.find((t) => t.type === entry.type)
                                    ?.label
                                }
                                {entry.notes && ` • ${entry.notes}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(entry.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.volume}ml
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.dailyAverage}
                  </p>
                  <p className="text-sm text-gray-500">Kunlik o'rtacha</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.streak.current}
                  </p>
                  <p className="text-sm text-gray-500">Kun ketma-ketlik</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <span>Gidratatsiya darajasi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">A'lo</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${insights.hydrationLevel.excellent}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {insights.hydrationLevel.excellent}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Yaxshi</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${insights.hydrationLevel.good}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {insights.hydrationLevel.good}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">O'rtacha</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${insights.hydrationLevel.moderate}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {insights.hydrationLevel.moderate}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kam</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${insights.hydrationLevel.poor}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {insights.hydrationLevel.poor}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Benefits */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Salomatlik foydalari</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Teri sog'ligi</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.skinHealth}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.skinHealth}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Energiya darajasi
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.energyLevel}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.energyLevel}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Detoksifikatsiya
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.detoxification}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.detoxification}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vazn nazorati</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.weightManagement}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.weightManagement}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span>Tavsiyalar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>So'nggi 7 kun</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Tarix ma'lumotlari yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              session.goalReached
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {session.goalReached ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Droplets className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(session.date).toLocaleDateString(
                                "uz-UZ",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.entries.length} ta yozuv
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {session.totalIntake.toFixed(1)} / {session.goal}
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.round(
                              (session.totalIntake / session.goal) * 100,
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Suv maqsadlari</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingGoals ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dailyGlasses">
                        Kunlik maqsad (stakan)
                      </Label>
                      <Input
                        id="dailyGlasses"
                        type="number"
                        value={tempGoals?.dailyGlasses}
                        onChange={(e) =>
                          setTempGoals((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  dailyGlasses: parseInt(e.target.value),
                                }
                              : null,
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleUpdateGoals}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Saqlash
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingGoals(false);
                          setTempGoals(waterGoals);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">
                          Kunlik maqsad
                        </p>
                        <p className="text-sm text-gray-500">
                          Har kuni ichish kerak bo'lgan suv
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {waterGoals.dailyGlasses}
                        </p>
                        <p className="text-sm text-gray-500">stakan</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Hajm</p>
                        <p className="text-sm text-gray-500">
                          Millilitr hisobida
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {waterGoals.dailyVolume}
                        </p>
                        <p className="text-sm text-gray-500">ml</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsEditingGoals(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Maqsadlarni o'zgartirish
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
