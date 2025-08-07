import React, { useState, useEffect, useMemo } from "react";
import {
  Footprints,
  Target,
  TrendingUp,
  Award,
  Zap,
  MapPin,
  Clock,
  Flame,
  Activity,
  Calendar,
  Trophy,
  Star,
  ChevronRight,
  Play,
  Pause,
  Plus,
  Settings,
  Share,
  BarChart3,
  Timer,
  Route,
  Heart,
  ArrowLeft,
  Medal,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import {
  getTodaySteps,
  addSteps,
  getStepGoals,
  updateStepGoals,
  getStepHistory,
  getStepInsights,
  checkAchievements,
  getUserAchievements,
  addSampleStepData,
  simulateStepCounting,
  getActiveStepChallenges,
  createDefaultChallenges,
  updateChallengeProgress,
  calculateDistance,
  calculateCaloriesFromSteps,
  type StepSession,
  type StepGoals,
  type StepInsights,
  type StepAchievement,
  type StepChallenge,
} from "@/utils/stepTracking";

// Activity tracking component
interface ActivityTrackerProps {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
  currentActivity: string;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  isTracking,
  onStart,
  onStop,
  currentActivity,
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={`border-2 ${isTracking ? "border-green-300 bg-green-50" : "border-gray-200"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isTracking
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {isTracking ? currentActivity : "Faoliyat tracking"}
              </div>
              <div className="text-sm text-gray-500">
                {isTracking ? formatTime(duration) : "Boshlash uchun bosing"}
              </div>
            </div>
          </div>

          <Button
            onClick={isTracking ? onStop : onStart}
            className={`w-12 h-12 rounded-full ${
              isTracking
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isTracking ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Step chart component (simplified)
interface StepChartProps {
  history: StepSession[];
  goal: number;
}

const StepChart: React.FC<StepChartProps> = ({ history, goal }) => {
  const last7Days = history.slice(0, 7).reverse();

  if (last7Days.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p>Ma'lumotlar yo'q</p>
      </div>
    );
  }

  const maxSteps = Math.max(...last7Days.map((s) => s.steps), goal);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between h-32 space-x-2">
        {last7Days.map((session, index) => {
          const height = (session.steps / maxSteps) * 100;
          const goalHeight = (goal / maxSteps) * 100;
          const isGoalMet = session.steps >= goal;

          return (
            <div key={session.id} className="flex-1 relative">
              {/* Goal line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-blue-400"
                style={{ bottom: `${goalHeight}%` }}
              />

              {/* Step bar */}
              <div className="flex flex-col items-center h-full justify-end">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isGoalMet ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span className="text-blue-600">🎯 {goal.toLocaleString()}</span>
        <span>{maxSteps.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Main component
export default function StepTracker() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "challenges" | "achievements" | "goals"
  >("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState("Yurish");
  const [todaySteps, setTodaySteps] = useState<StepSession | null>(null);
  const [stepGoals, setStepGoals] = useState<StepGoals | null>(null);
  const [stepInsights, setStepInsights] = useState<StepInsights | null>(null);
  const [stepHistory, setStepHistory] = useState<StepSession[]>([]);
  const [achievements, setAchievements] = useState<StepAchievement[]>([]);
  const [challenges, setChallenges] = useState<StepChallenge[]>([]);
  const [newAchievements, setNewAchievements] = useState<StepAchievement[]>([]);

  // Form states for goals
  const [dailyStepsGoal, setDailyStepsGoal] = useState(10000);
  const [dailyDistanceGoal, setDailyDistanceGoal] = useState(7.5);
  const [dailyActiveMinutesGoal, setDailyActiveMinutesGoal] = useState(150);

  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  // Load data on component mount
  useEffect(() => {
    if (user) {
      setIsLoading(true);

      try {
        // Initialize data
        addSampleStepData(
          telegramId,
          parseFloat(user.height),
          parseFloat(user.weight),
        );
        createDefaultChallenges(telegramId);

        // Load current data
        const steps = getTodaySteps(telegramId);
        const goals = getStepGoals(telegramId);
        const insights = getStepInsights(telegramId);
        const history = getStepHistory(telegramId, 30);
        const userAchievements = getUserAchievements(telegramId);
        const activeChallenges = getActiveStepChallenges(telegramId);

        setTodaySteps(steps);
        setStepGoals(goals);
        setStepInsights(insights);
        setStepHistory(history);
        setAchievements(userAchievements);
        setChallenges(activeChallenges);

        // Set form values
        setDailyStepsGoal(goals.dailySteps);
        setDailyDistanceGoal(goals.dailyDistance);
        setDailyActiveMinutesGoal(goals.dailyActiveMinutes);

        // Check for new achievements
        const newAchievements = checkAchievements(telegramId);
        if (newAchievements.length > 0) {
          setNewAchievements(newAchievements);
          setAchievements(getUserAchievements(telegramId));
        }

        // Update challenge progress
        updateChallengeProgress(telegramId);
      } catch (error) {
        console.error("Error loading step data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, telegramId]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (telegramId) {
        const steps = getTodaySteps(telegramId);
        setTodaySteps(steps);

        const insights = getStepInsights(telegramId);
        setStepInsights(insights);

        updateChallengeProgress(telegramId);
        const activeChallenges = getActiveStepChallenges(telegramId);
        setChallenges(activeChallenges);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [telegramId]);

  // Progress calculations
  const todayProgress = useMemo(() => {
    if (!todaySteps || !stepGoals) return 0;
    return (todaySteps.steps / stepGoals.dailySteps) * 100;
  }, [todaySteps, stepGoals]);

  const distanceProgress = useMemo(() => {
    if (!todaySteps || !stepGoals) return 0;
    return (todaySteps.distance / stepGoals.dailyDistance) * 100;
  }, [todaySteps, stepGoals]);

  const activeMinutesProgress = useMemo(() => {
    if (!todaySteps || !stepGoals) return 0;
    return (todaySteps.activeMinutes / stepGoals.dailyActiveMinutes) * 100;
  }, [todaySteps, stepGoals]);

  // Handle manual step addition
  const handleAddSteps = (steps: number) => {
    if (!user) return;

    const updated = addSteps(
      telegramId,
      steps,
      parseFloat(user.height),
      parseFloat(user.weight),
    );
    setTodaySteps(updated);

    // Check for new achievements
    const newAchievements = checkAchievements(telegramId);
    if (newAchievements.length > 0) {
      setNewAchievements(newAchievements);
      setAchievements(getUserAchievements(telegramId));
      // Send push for first new achievement (respect meals notif as generic activity channel)
      try {
        const enabled = localStorage.getItem(`notif_meals_${telegramId}`);
        if (enabled === null || enabled === 'true') {
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramId, template: 'steps_goal' }),
          });
        }
      } catch {}
    }
  };

  // Handle activity tracking
  const handleStartTracking = () => {
    setIsTracking(true);
    simulateStepCounting(telegramId);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  // Handle goals update
  const handleUpdateGoals = () => {
    const updatedGoals = updateStepGoals(telegramId, {
      dailySteps: dailyStepsGoal,
      dailyDistance: dailyDistanceGoal,
      dailyActiveMinutes: dailyActiveMinutesGoal,
    });

    setStepGoals(updatedGoals);
    alert("Maqsadlar saqlandi!");
  };

  if (isLoading || !user || !todaySteps || !stepGoals) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Step data yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Qadam Tracker</h1>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>

          {/* Today's Main Stats */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2">
              {todaySteps.steps.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm mb-4">
              Bugungi qadamlar • {stepGoals.dailySteps.toLocaleString()} maqsad
            </div>

            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(todayProgress, 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">
                  {todaySteps.distance.toFixed(1)}
                </div>
                <div className="text-xs text-blue-100">km</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{todaySteps.calories}</div>
                <div className="text-xs text-blue-100">kaloriya</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {todaySteps.activeMinutes}
                </div>
                <div className="text-xs text-blue-100">daqiqa</div>
              </div>
            </div>
          </div>

          {/* Achievement Alert */}
          {newAchievements.length > 0 && (
            <div className="bg-yellow-400 text-yellow-900 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Yangi muvaffaqiyat!</div>
                  <div className="text-sm">
                    {newAchievements[0].title} -{" "}
                    {newAchievements[0].description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 mx-4 mt-4 rounded-2xl p-1">
          {[
            { id: "dashboard", label: "Asosiy", icon: BarChart3 },
            { id: "challenges", label: "Challenges", icon: Target },
            { id: "achievements", label: "Yutuqlar", icon: Award },
            { id: "goals", label: "Maqsad", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl font-medium text-xs transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 pb-20">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Activity Tracker */}
              <ActivityTracker
                isTracking={isTracking}
                onStart={handleStartTracking}
                onStop={handleStopTracking}
                currentActivity={currentActivity}
              />

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Tezkor qo'shish</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={() => handleAddSteps(500)}
                      variant="outline"
                      className="h-16 flex flex-col space-y-1"
                    >
                      <span className="text-lg font-bold">500</span>
                      <span className="text-xs">qadam</span>
                    </Button>
                    <Button
                      onClick={() => handleAddSteps(1000)}
                      variant="outline"
                      className="h-16 flex flex-col space-y-1"
                    >
                      <span className="text-lg font-bold">1K</span>
                      <span className="text-xs">qadam</span>
                    </Button>
                    <Button
                      onClick={() => handleAddSteps(2000)}
                      variant="outline"
                      className="h-16 flex flex-col space-y-1"
                    >
                      <span className="text-lg font-bold">2K</span>
                      <span className="text-xs">qadam</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Route className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Masofa
                        </div>
                        <div className="text-sm text-gray-500">
                          {todaySteps.distance.toFixed(1)}/
                          {stepGoals.dailyDistance} km
                        </div>
                      </div>
                    </div>
                    <Progress value={distanceProgress} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Timer className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Faol vaqt
                        </div>
                        <div className="text-sm text-gray-500">
                          {todaySteps.activeMinutes}/
                          {stepGoals.dailyActiveMinutes} daq
                        </div>
                      </div>
                    </div>
                    <Progress value={activeMinutesProgress} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Haftalik statistika</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StepChart
                    history={stepHistory}
                    goal={stepGoals.dailySteps}
                  />
                </CardContent>
              </Card>

              {/* Insights */}
              {stepInsights && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>AI Tahlil</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-700">
                          {stepInsights.dailyAverage.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">
                          Kunlik o'rtacha
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-700">
                          {stepInsights.longestStreak.current}
                        </div>
                        <div className="text-xs text-green-600">
                          Joriy streak
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {stepInsights.recommendations
                        .slice(0, 3)
                        .map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === "challenges" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Challenges
                </h2>
                <p className="text-gray-600">
                  Maqsadlaringizga erishing va mukofotlar qo'lga kiriting!
                </p>
              </div>

              {challenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {challenge.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{challenge.participants} ishtirokchi</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{challenge.reward.points} ochko</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">{challenge.reward.badge}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Jarayon</span>
                        <span className="font-semibold">
                          {challenge.progress.toLocaleString()}/
                          {challenge.target.toLocaleString()} {challenge.unit}
                        </span>
                      </div>
                      <Progress
                        value={(challenge.progress / challenge.target) * 100}
                        className="h-2"
                      />

                      {challenge.isCompleted && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm font-semibold">
                          <Trophy className="w-4 h-4" />
                          <span>Mukammal!</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Yutuqlar
                </h2>
                <p className="text-gray-600">
                  {achievements.length} ta yutuq qo'lga kiritdingiz!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="text-center">
                    <CardContent className="p-4">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {achievement.description}
                      </p>
                      <Badge
                        variant={
                          achievement.rarity === "legendary"
                            ? "default"
                            : achievement.rarity === "epic"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {achievement.rarity === "legendary"
                          ? "Legendary"
                          : achievement.rarity === "epic"
                            ? "Epic"
                            : achievement.rarity === "rare"
                              ? "Rare"
                              : "Common"}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        +{achievement.points} ochko
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {achievements.length === 0 && (
                <div className="text-center py-8">
                  <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Hali yutuqlar yo'q. Qadam tashlashni boshlang!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Maqsadlar
                </h2>
                <p className="text-gray-600">
                  Shaxsiy maqsadlaringizni belgilang
                </p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Kunlik maqsadlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="daily-steps">Kunlik qadamlar</Label>
                    <Input
                      id="daily-steps"
                      type="number"
                      value={dailyStepsGoal}
                      onChange={(e) =>
                        setDailyStepsGoal(parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="daily-distance">Kunlik masofa (km)</Label>
                    <Input
                      id="daily-distance"
                      type="number"
                      step="0.5"
                      value={dailyDistanceGoal}
                      onChange={(e) =>
                        setDailyDistanceGoal(parseFloat(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="active-minutes">
                      Kunlik faol daqiqalar
                    </Label>
                    <Input
                      id="active-minutes"
                      type="number"
                      value={dailyActiveMinutesGoal}
                      onChange={(e) =>
                        setDailyActiveMinutesGoal(parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleUpdateGoals} className="w-full">
                    Maqsadlarni saqlash
                  </Button>
                </CardContent>
              </Card>

              {/* Health Metrics */}
              {stepInsights && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span>Salomatlik ko'rsatkichlari</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Yurak-qon tomir salomatligi</span>
                        <span>
                          {stepInsights.healthMetrics.cardiovascularHealth}%
                        </span>
                      </div>
                      <Progress
                        value={stepInsights.healthMetrics.cardiovascularHealth}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fitness darajasi</span>
                        <span>{stepInsights.healthMetrics.fitnessLevel}%</span>
                      </div>
                      <Progress
                        value={stepInsights.healthMetrics.fitnessLevel}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vazn nazorati</span>
                        <span>
                          {stepInsights.healthMetrics.weightManagement}%
                        </span>
                      </div>
                      <Progress
                        value={stepInsights.healthMetrics.weightManagement}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
