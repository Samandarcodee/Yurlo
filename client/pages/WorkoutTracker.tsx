import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Play,
  Pause,
  Clock,
  Target,
  TrendingUp,
  Award,
  Calendar,
  BarChart,
  Zap,
  Activity,
  Timer,
  CheckCircle,
  MapPin,
  Heart,
  Flame,
  User,
  Settings,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import {
  getTodayWorkouts,
  addWorkoutSession,
  getWorkoutGoals,
  updateWorkoutGoals,
  getWorkoutInsights,
  getWorkoutHistory,
  addSampleWorkoutData,
  logQuickWorkout,
  calculateWorkoutCalories,
  getWeeklyWorkoutSummary,
  WORKOUT_TYPE_LABELS,
  WORKOUT_PLANS,
  WorkoutSession,
  WorkoutGoals,
  WorkoutInsights,
  WorkoutType,
  WorkoutPlan,
} from "@/utils/workoutTracking";

export default function WorkoutTracker() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();

  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSession[]>([]);
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoals | null>(null);
  const [insights, setInsights] = useState<WorkoutInsights | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // Quick workout states
  const [selectedType, setSelectedType] = useState<WorkoutType>("strength");
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">(
    "moderate",
  );
  const [notes, setNotes] = useState("");

  // Goals editing states
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState<WorkoutGoals | null>(null);

  // Timer states
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentWorkout, setCurrentWorkout] =
    useState<Partial<WorkoutSession> | null>(null);

  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  useEffect(() => {
    if (user) {
      // Initialize data
      addSampleWorkoutData(telegramId, parseFloat(user.weight));

      // Load today's workouts
      const today = getTodayWorkouts(telegramId);
      setTodayWorkouts(today);

      // Load goals
      const goals = getWorkoutGoals(telegramId);
      setWorkoutGoals(goals);
      setTempGoals(goals);

      // Load insights
      const insightsData = getWorkoutInsights(telegramId);
      setInsights(insightsData);

      // Load weekly stats
      const weekly = getWeeklyWorkoutSummary(telegramId);
      setWeeklyStats(weekly);

      // Load history
      const historyData = getWorkoutHistory(telegramId, 7);
      setHistory(historyData);
    }
  }, [user, telegramId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isTimerActive && timerSeconds !== 0) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerSeconds]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleQuickWorkout = () => {
    if (!user) return;

    logQuickWorkout(
      telegramId,
      selectedType,
      duration,
      intensity,
      parseFloat(user.weight),
    );

    // Refresh data
    const today = getTodayWorkouts(telegramId);
    setTodayWorkouts(today);

    const weekly = getWeeklyWorkoutSummary(telegramId);
    setWeeklyStats(weekly);

    const insightsData = getWorkoutInsights(telegramId);
    setInsights(insightsData);

    setNotes("");
  };

  const handleStartWorkout = (type: WorkoutType) => {
    setCurrentWorkout({
      name: WORKOUT_TYPE_LABELS[type].label,
      type,
      startTime: new Date().toISOString(),
      intensity: "moderate",
    });
    setTimerSeconds(0);
    setIsTimerActive(true);
  };

  const handleFinishWorkout = () => {
    if (!currentWorkout || !user) return;

    const endTime = new Date().toISOString();
    const durationMinutes = Math.floor(timerSeconds / 60);

    const newWorkout: Omit<WorkoutSession, "id"> = {
      date: new Date().toISOString().split("T")[0],
      name: currentWorkout.name || "Mashq",
      type: currentWorkout.type || "strength",
      duration: durationMinutes,
      caloriesBurned: calculateWorkoutCalories(
        currentWorkout.type || "strength",
        durationMinutes,
        currentWorkout.intensity || "moderate",
        parseFloat(user.weight),
      ),
      exercises: [],
      intensity: currentWorkout.intensity || "moderate",
      startTime: currentWorkout.startTime || new Date().toISOString(),
      endTime,
      mood: "motivated",
      difficulty: 3,
      equipment: ["none"],
      restTime: Math.floor(durationMinutes * 0.1),
      notes: notes.trim() || undefined,
    };

    const updated = addWorkoutSession(telegramId, newWorkout);
    setTodayWorkouts(updated);

    // Reset timer
    setIsTimerActive(false);
    setTimerSeconds(0);
    setCurrentWorkout(null);
    setNotes("");

    // Refresh data
    const weekly = getWeeklyWorkoutSummary(telegramId);
    setWeeklyStats(weekly);

    const insightsData = getWorkoutInsights(telegramId);
    setInsights(insightsData);
  };

  const handleUpdateGoals = () => {
    if (tempGoals) {
      const updated = updateWorkoutGoals(telegramId, tempGoals);
      setWorkoutGoals(updated);
      setIsEditingGoals(false);
    }
  };

  const todayMinutes = useMemo(() => {
    return todayWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  }, [todayWorkouts]);

  const todayCalories = useMemo(() => {
    return todayWorkouts.reduce(
      (sum, workout) => sum + workout.caloriesBurned,
      0,
    );
  }, [todayWorkouts]);

  const weeklyProgress = useMemo(() => {
    if (!workoutGoals || !weeklyStats) return 0;
    return Math.round(
      (weeklyStats.totalMinutes / workoutGoals.weeklyMinutes) * 100,
    );
  }, [weeklyStats, workoutGoals]);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "extreme":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!workoutGoals || !insights || !weeklyStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20">
      <div className="safe-area-top bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">
                Workout Tracker
              </span>
            </Link>
            <Badge
              variant="secondary"
              className={`${
                weeklyProgress >= 100
                  ? "bg-green-100 text-green-800"
                  : weeklyProgress >= 70
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-orange-100 text-orange-800"
              }`}
            >
              💪 {weeklyProgress}%
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Active Workout Timer */}
        {isTimerActive && currentWorkout && (
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <Timer className="h-16 w-16 mx-auto mb-2 opacity-90" />
                  <h2 className="text-3xl font-bold">
                    {formatTime(timerSeconds)}
                  </h2>
                  <p className="text-orange-100">{currentWorkout.name}</p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setIsTimerActive(!isTimerActive)}
                    variant="secondary"
                    className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    {isTimerActive ? (
                      <Pause className="mr-2 h-4 w-4" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    {isTimerActive ? "Pauza" : "Davom etish"}
                  </Button>
                  <Button
                    onClick={handleFinishWorkout}
                    variant="secondary"
                    className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Tugatish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Progress */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <p className="text-2xl font-bold">{todayMinutes}</p>
                <p className="text-orange-100 text-sm">daqiqa</p>
              </div>
              <div>
                <Flame className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <p className="text-2xl font-bold">{todayCalories}</p>
                <p className="text-orange-100 text-sm">kaloriya</p>
              </div>
              <div>
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <p className="text-2xl font-bold">{todayWorkouts.length}</p>
                <p className="text-orange-100 text-sm">mashq</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-orange-100 mb-2">
                <span>Haftalik progress</span>
                <span>
                  {weeklyStats.totalMinutes} / {workoutGoals.weeklyMinutes} min
                </span>
              </div>
              <Progress
                value={weeklyProgress}
                className="h-3 bg-orange-400 [&>*]:bg-white"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="quick" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-12 rounded-2xl bg-white shadow-md">
            <TabsTrigger value="quick" className="rounded-xl text-xs">
              Quick
            </TabsTrigger>
            <TabsTrigger value="plans" className="rounded-xl text-xs">
              Rejalar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl text-xs">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl text-xs">
              Tarix
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl text-xs">
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Quick Workout Tab */}
          <TabsContent value="quick" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span>Tezkor mashq</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Workout Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Mashq turi
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(WORKOUT_TYPE_LABELS)
                      .slice(0, 8)
                      .map(([type, info]) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type as WorkoutType)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            selectedType === type
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <div className="text-lg mb-1">{info.icon}</div>
                          <div className="text-sm font-medium">
                            {info.label}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Davomiyligi: {duration} daqiqa
                  </Label>
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {/* Intensity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Intensivlik
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["low", "moderate", "high"].map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setIntensity(level as "low" | "moderate" | "high")
                        }
                        className={`p-3 rounded-xl border-2 transition-all ${
                          intensity === level
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">
                          {level === "low"
                            ? "Past"
                            : level === "moderate"
                              ? "O'rtacha"
                              : "Yuqori"}
                        </div>
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
                    Izohlar (ixtiyoriy)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mashq haqida qo'shimcha ma'lumot..."
                    className="mt-1 h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleStartWorkout(selectedType)}
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Timer bilan boshlash
                  </Button>
                  <Button
                    onClick={handleQuickWorkout}
                    className="h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tezkor qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Workouts */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span>Bugungi mashqlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayWorkouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Hali hech qanday mashq qilinmagan</p>
                    <p className="text-sm">
                      Yuqoridan birinchi mashqni boshlang
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayWorkouts
                      .sort(
                        (a, b) =>
                          new Date(b.startTime).getTime() -
                          new Date(a.startTime).getTime(),
                      )
                      .map((workout) => (
                        <div
                          key={workout.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              {WORKOUT_TYPE_LABELS[workout.type]?.icon || "💪"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {workout.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {workout.duration} min •{" "}
                                {workout.caloriesBurned} kal
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={getIntensityColor(workout.intensity)}
                            >
                              {workout.intensity === "low"
                                ? "Past"
                                : workout.intensity === "moderate"
                                  ? "O'rtacha"
                                  : workout.intensity === "high"
                                    ? "Yuqori"
                                    : "Ekstrem"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(workout.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workout Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-4">
              {WORKOUT_PLANS.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          {WORKOUT_TYPE_LABELS[plan.type]?.icon || "💪"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {"⭐".repeat(plan.difficulty)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {plan.duration} min
                      </span>
                      <span className="flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        {plan.targetCalories} kal
                      </span>
                      <span className="flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {plan.exercises.length} mashq
                      </span>
                    </div>

                    <Button
                      onClick={() => handleStartWorkout(plan.type)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Boshlash
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {weeklyStats.totalWorkouts}
                  </p>
                  <p className="text-sm text-gray-500">Haftalik mashqlar</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.performance.consistencyScore}%
                  </p>
                  <p className="text-sm text-gray-500">Izchillik</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5 text-orange-600" />
                  <span>Salomatlik foydalari</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Yurak-qon tomir</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.cardiovascularHealth}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.cardiovascularHealth}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mushak kuchi</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.muscularStrength}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.muscularStrength}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Moslashuvchanlik
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.flexibility}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.flexibility}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Ruhiy salomatlik
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${insights.healthBenefits.mentalHealth}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">
                      {insights.healthBenefits.mentalHealth}%
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
                    <Zap className="h-5 w-5 text-yellow-600" />
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
                  <Calendar className="h-5 w-5 text-orange-600" />
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
                    {history.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            {WORKOUT_TYPE_LABELS[workout.type]?.icon || "💪"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {workout.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(workout.date).toLocaleDateString(
                                "uz-UZ",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {workout.duration} min
                          </p>
                          <p className="text-sm text-gray-500">
                            {workout.caloriesBurned} kal
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
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Mashq maqsadlari</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingGoals ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="weeklyWorkouts">
                        Haftalik mashqlar soni
                      </Label>
                      <Input
                        id="weeklyWorkouts"
                        type="number"
                        value={tempGoals?.weeklyWorkouts}
                        onChange={(e) =>
                          setTempGoals((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  weeklyWorkouts: parseInt(e.target.value),
                                }
                              : null,
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weeklyMinutes">Haftalik daqiqalar</Label>
                      <Input
                        id="weeklyMinutes"
                        type="number"
                        value={tempGoals?.weeklyMinutes}
                        onChange={(e) =>
                          setTempGoals((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  weeklyMinutes: parseInt(e.target.value),
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
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        Saqlash
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingGoals(false);
                          setTempGoals(workoutGoals);
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
                          Haftalik mashqlar
                        </p>
                        <p className="text-sm text-gray-500">
                          Haftada necha marta mashq qilish
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">
                          {workoutGoals.weeklyWorkouts}
                        </p>
                        <p className="text-sm text-gray-500">marta</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">
                          Haftalik daqiqalar
                        </p>
                        <p className="text-sm text-gray-500">
                          Jami mashq vaqti
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">
                          {workoutGoals.weeklyMinutes}
                        </p>
                        <p className="text-sm text-gray-500">daqiqa</p>
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
