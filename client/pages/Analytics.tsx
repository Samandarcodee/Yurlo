import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  Heart,
  Droplets,
  Footprints,
  Moon,
  Utensils,
  Flame,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Shield,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  Share,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import {
  getAnalyticsOverview,
  getCaloriesChartData,
  getWeightChartData,
  getStepsChartData,
  getSleepChartData,
  getNutritionAnalytics,
  getActivityAnalytics,
  getBodyCompositionData,
  calculateHealthScore,
  getPerformanceMetrics,
  type AnalyticsOverview,
  type TrendData,
  type NutritionAnalytics,
  type ActivityAnalytics,
} from "@/utils/analyticsData";

export default function Analytics() {
  const { user } = useUser();
  const { user: telegramUser } = useTelegram();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [healthScore, setHealthScore] = useState<{
    score: number;
    factors: any[];
  } | null>(null);
  const [caloriesData, setCaloriesData] = useState<TrendData | null>(null);
  const [weightData, setWeightData] = useState<TrendData | null>(null);
  const [stepsData, setStepsData] = useState<TrendData | null>(null);
  const [sleepData, setSleepData] = useState<TrendData | null>(null);
  const [nutritionAnalytics, setNutritionAnalytics] =
    useState<NutritionAnalytics | null>(null);
  const [activityAnalytics, setActivityAnalytics] =
    useState<ActivityAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const telegramId = telegramUser?.id?.toString() || "demo_user_123";

  useEffect(() => {
    if (user) {
      setIsLoading(true);

      try {
        // Load all analytics data
        const overviewData = getAnalyticsOverview(telegramId);
        const healthScoreData = calculateHealthScore(telegramId);
        const caloriesChartData = getCaloriesChartData(
          telegramId,
          selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365,
        );
        const weightChartData = getWeightChartData(
          telegramId,
          selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365,
        );
        const stepsChartData = getStepsChartData(
          telegramId,
          selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365,
        );
        const sleepChartData = getSleepChartData(
          telegramId,
          selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365,
        );
        const nutritionData = getNutritionAnalytics(telegramId);
        const activityData = getActivityAnalytics(telegramId);

        setOverview(overviewData);
        setHealthScore(healthScoreData);
        setCaloriesData(caloriesChartData);
        setWeightData(weightChartData);
        setStepsData(stepsChartData);
        setSleepData(sleepChartData);
        setNutritionAnalytics(nutritionData);
        setActivityAnalytics(activityData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, telegramId, selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const chartColors = {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
  };

  if (isLoading || !overview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/60 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Analytics yuklanmoqda</h2>
            <p className="text-muted-foreground">Ma'lumotlar tahlil qilinmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 dark:from-background dark:via-card dark:to-muted/20 pb-20 transition-colors duration-300">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-muted/20 to-primary/5 dark:from-muted/30 dark:to-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header with Theme Support */}
      <div className="safe-area-top bg-background/90 dark:bg-card/90 backdrop-blur-xl border-b border-border/30 dark:border-border/20 shadow-lg dark:shadow-2xl relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ArrowLeft className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Analytics Dashboard
                </span>
                <p className="text-sm text-muted-foreground">
                  Sog'liq tahlili va progress
                </p>
              </div>
            </Link>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-background/70 dark:bg-card/70 backdrop-blur-sm border-border/30 hover:bg-background/90 dark:hover:bg-card/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2 text-primary" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white border-0 hover:from-primary/90 hover:via-primary hover:to-accent/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Enhanced Health Score with Theme Support */}
        <Card className="border-0 shadow-2xl dark:shadow-3xl bg-gradient-to-br from-card/95 via-background/90 to-muted/30 dark:from-card/90 dark:via-background/80 dark:to-muted/20 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl dark:hover:shadow-4xl transition-all duration-500">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 dark:from-primary/30 to-transparent rounded-full blur-2xl"></div>

          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Sog'liq Bahosi
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Umumiy salomatlik ko'rsatkichi
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Animated Score Display */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-2xl animate-pulse">
                  <div className="w-full h-full rounded-full bg-background dark:bg-card flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold ${getHealthScoreColor(healthScore?.score || 0)}`}
                      >
                        {healthScore?.score || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        /100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Badge */}
                <div
                  className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${getHealthScoreBg(healthScore?.score || 0)} ${getHealthScoreColor(healthScore?.score || 0)} shadow-lg border border-background dark:border-card`}
                >
                  {(healthScore?.score || 0) >= 80
                    ? "A'lo"
                    : (healthScore?.score || 0) >= 60
                      ? "Yaxshi"
                      : "Yaxshilash kerak"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {healthScore?.factors.map((factor, index) => (
                <div
                  key={index}
                  className="group hover:bg-white/50 p-3 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {factor.name}
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {Math.round(factor.score)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                          factor.score >= 80
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : factor.score >= 60
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-red-400 to-red-600"
                        } shadow-lg`}
                        style={{
                          width: `${factor.score}%`,
                          boxShadow:
                            factor.score >= 80
                              ? "0 0 20px rgba(34, 197, 94, 0.3)"
                              : factor.score >= 60
                                ? "0 0 20px rgba(251, 191, 36, 0.3)"
                                : "0 0 20px rgba(239, 68, 68, 0.3)",
                        }}
                      ></div>
                    </div>

                    {/* Progress Glow Effect */}
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full opacity-50 ${
                        factor.score >= 80
                          ? "bg-green-400"
                          : factor.score >= 60
                            ? "bg-yellow-400"
                            : "bg-red-400"
                      } blur-sm`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Calories Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Utensils className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Flame className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                {Math.round(overview.averageCalories)}
              </p>
              <p className="text-sm text-blue-100 font-medium">
                Kunlik kaloriya
              </p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Steps Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Footprints className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <Target className="h-3 w-3 text-orange-800" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                {(overview.averageSteps / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-green-100 font-medium">
                Kunlik qadamlar
              </p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((overview.averageSteps / 10000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Moon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-cyan-800" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                {overview.averageSleep.toFixed(1)}h
              </p>
              <p className="text-sm text-purple-100 font-medium">Uyqu vaqti</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((overview.averageSleep / 8) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Water Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <CardContent className="p-6 text-center relative z-10">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Droplets className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-blue-800" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                {overview.averageWater.toFixed(1)}
              </p>
              <p className="text-sm text-cyan-100 font-medium">Stakan suv</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((overview.averageWater / 8) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Period Selector */}
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/20">
            <div className="grid grid-cols-3 gap-2">
              {["week", "month", "year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as any)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-800 hover:scale-102"
                  }`}
                >
                  {selectedPeriod === period && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-xl"></div>
                  )}
                  <span className="relative z-10">
                    {period === "week"
                      ? "📅 Hafta"
                      : period === "month"
                        ? "🗓️ Oy"
                        : "📊 Yil"}
                  </span>
                  {selectedPeriod === period && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/60 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 p-1">
            <TabsTrigger
              value="charts"
              className="rounded-xl font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105"
            >
              📊 Grafiklar
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="rounded-xl font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105"
            >
              🍎 Oziq
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-xl font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105"
            >
              💪 Faollik
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {/* Enhanced Calories Chart */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-3xl"></div>

              <CardHeader className="pb-6 relative z-10">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Kaloriya Tendensiyasi
                      </span>
                      <p className="text-sm text-gray-500">
                        Kunlik iste'mol dinamikasi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg">
                      {getTrendIcon(caloriesData?.trend || "stable")}
                      <span
                        className={`text-sm font-bold ${getTrendColor(caloriesData?.trend || "stable")}`}
                      >
                        {caloriesData?.changePercentage}%
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={caloriesData?.data || []}>
                      <defs>
                        <linearGradient
                          id="caloriesGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f97316"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f97316"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "16px",
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "bold" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#f97316"
                        strokeWidth={3}
                        fill="url(#caloriesGradient)"
                        dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Steps Chart */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-3xl"></div>

              <CardHeader className="pb-6 relative z-10">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                      <Footprints className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Qadamlar Dinamikasi
                      </span>
                      <p className="text-sm text-gray-500">
                        Kunlik faollik ko'rsatkichi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg">
                      {getTrendIcon(stepsData?.trend || "stable")}
                      <span
                        className={`text-sm font-bold ${getTrendColor(stepsData?.trend || "stable")}`}
                      >
                        {stepsData?.changePercentage}%
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stepsData?.data || []}>
                      <defs>
                        <linearGradient
                          id="stepsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "16px",
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "bold" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#stepsGradient)"
                        radius={[8, 8, 0, 0]}
                        stroke="#10b981"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Weight & Sleep Charts */}
            <div className="grid grid-cols-1 gap-6">
              {/* Weight Chart */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-2xl"></div>

                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Vazn Dinamikasi
                      </span>
                      <p className="text-xs text-gray-500">
                        Tana vazni o'zgarishi
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <ResponsiveContainer width="100%" height={170}>
                      <RechartsLineChart data={weightData?.data || []}>
                        <defs>
                          <linearGradient
                            id="weightGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(8px)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                          activeDot={{
                            r: 7,
                            stroke: "#8b5cf6",
                            strokeWidth: 2,
                            fill: "#ffffff",
                          }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Chart */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-2xl"></div>

                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 shadow-lg">
                      <Moon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Uyqu Grafigi
                      </span>
                      <p className="text-xs text-gray-500">Kunlik uyqu vaqti</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <ResponsiveContainer width="100%" height={170}>
                      <AreaChart data={sleepData?.data || []}>
                        <defs>
                          <linearGradient
                            id="sleepGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(8px)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="url(#sleepGradient)"
                          dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#6366f1",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            {nutritionAnalytics && (
              <>
                {/* Enhanced Macro Distribution */}
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-3xl"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                          <PieChart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Makro Tarkibi
                          </span>
                          <p className="text-sm text-gray-500">
                            Protein, uglevodlar va yog'lar nisbati
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 font-bold">
                        📊 Muvozanat
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {/* Macro Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                          Protein
                        </p>
                        <p className="text-2xl font-bold">
                          {nutritionAnalytics.macroDistribution.protein}%
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/90 to-emerald-600/90 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                          Karbohidrat
                        </p>
                        <p className="text-2xl font-bold">
                          {nutritionAnalytics.macroDistribution.carbs}%
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/90 to-orange-600/90 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <p className="text-sm font-medium opacity-90">Yog'</p>
                        <p className="text-2xl font-bold">
                          {nutritionAnalytics.macroDistribution.fat}%
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Pie Chart */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: "Protein",
                                value:
                                  nutritionAnalytics.macroDistribution.protein,
                                fill: "#3B82F6",
                              },
                              {
                                name: "Karbohidrat",
                                value:
                                  nutritionAnalytics.macroDistribution.carbs,
                                fill: "#10B981",
                              },
                              {
                                name: "Yog'",
                                value: nutritionAnalytics.macroDistribution.fat,
                                fill: "#F59E0B",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={3}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "none",
                              borderRadius: "16px",
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                              backdropFilter: "blur(10px)",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Top Foods */}
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-3xl"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-600 shadow-lg">
                          <Utensils className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                            Eng Ko'p Iste'mol Qilingan
                          </span>
                          <p className="text-sm text-gray-500">
                            Sevimli taomlaringiz
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 font-bold">
                        🏆 TOP 5
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="space-y-4">
                        {nutritionAnalytics.topFoods.map((food, index) => (
                          <div
                            key={index}
                            className="group hover:bg-white/60 p-4 rounded-2xl transition-all duration-300 hover:scale-102 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                      index === 0
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                        : index === 1
                                          ? "bg-gradient-to-r from-gray-400 to-gray-600"
                                          : index === 2
                                            ? "bg-gradient-to-r from-orange-500 to-orange-700"
                                            : "bg-gradient-to-r from-blue-400 to-blue-600"
                                    }`}
                                  >
                                    <span className="text-white font-bold text-lg">
                                      #{index + 1}
                                    </span>
                                  </div>

                                  {/* Medal Icons */}
                                  {index < 3 && (
                                    <div className="absolute -top-2 -right-2">
                                      {index === 0 && (
                                        <div className="text-yellow-500 text-lg">
                                          🥇
                                        </div>
                                      )}
                                      {index === 1 && (
                                        <div className="text-gray-400 text-lg">
                                          🥈
                                        </div>
                                      )}
                                      {index === 2 && (
                                        <div className="text-orange-600 text-lg">
                                          🥉
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h3 className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                                    {food.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {food.frequency} marta iste'mol qilindi
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <Flame className="h-4 w-4 text-orange-500" />
                                  <span className="font-bold text-gray-800">
                                    {food.calories}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    kcal
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2 w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${Math.min((food.frequency / Math.max(...nutritionAnalytics.topFoods.map((f) => f.frequency))) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Enhanced Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {activityAnalytics && (
              <>
                {/* Enhanced Activity Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/90 to-indigo-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <CardContent className="p-6 text-center relative z-10">
                      <div className="relative">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                          <Activity className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-yellow-800" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                        {activityAnalytics.totalWorkouts}
                      </p>
                      <p className="text-sm text-blue-100 font-medium">
                        Jami mashqlar
                      </p>
                      <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((activityAnalytics.totalWorkouts / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500/90 to-orange-600/90 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <CardContent className="p-6 text-center relative z-10">
                      <div className="relative">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:bg-white/30 transition-all duration-300">
                          <Flame className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                          <Zap className="h-3 w-3 text-orange-800" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                        {activityAnalytics.caloriesBurned}
                      </p>
                      <p className="text-sm text-red-100 font-medium">
                        Yoqilgan kaloriya
                      </p>
                      <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((activityAnalytics.caloriesBurned / 3000) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Favorite Workouts */}
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Sevimli Mashqlar
                          </span>
                          <p className="text-sm text-gray-500">
                            Ko'p bajarilgan mashqlar
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 font-bold">
                        🏆 TOP
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="space-y-4">
                        {activityAnalytics.favoriteWorkouts.map(
                          (workout, index) => (
                            <div
                              key={index}
                              className="group hover:bg-white/60 p-4 rounded-2xl transition-all duration-300 hover:scale-102 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                        index === 0
                                          ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                                          : index === 1
                                            ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                                            : "bg-gradient-to-r from-green-500 to-emerald-600"
                                      }`}
                                    >
                                      <span className="text-white font-bold">
                                        {workout.type === "cardio"
                                          ? "🏃"
                                          : workout.type === "strength"
                                            ? "💪"
                                            : workout.type === "yoga"
                                              ? "🧘"
                                              : workout.type === "swimming"
                                                ? "🏊"
                                                : "🏋️"}
                                      </span>
                                    </div>

                                    {/* Rank Badge */}
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-yellow-800">
                                        #{index + 1}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors capitalize">
                                      {workout.type}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {workout.count} sessiya bajarildi
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4 text-purple-500" />
                                    <span className="font-bold text-gray-800">
                                      {workout.minutes}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      daqiqa
                                    </span>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mt-2 w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                                      style={{
                                        width: `${Math.min((workout.count / Math.max(...activityAnalytics.favoriteWorkouts.map((w) => w.count))) * 100, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Progress Score */}
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-3xl"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Taraqqiyot Bahosi
                          </span>
                          <p className="text-sm text-gray-500">
                            Izchillik va muvaffaqiyat
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`font-bold ${
                          activityAnalytics.progressScore >= 80
                            ? "bg-green-100 text-green-800"
                            : activityAnalytics.progressScore >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {activityAnalytics.progressScore >= 80
                          ? "🔥 A'lo"
                          : activityAnalytics.progressScore >= 60
                            ? "⭐ Yaxshi"
                            : "💪 Yaxshilanish kerak"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <div className="text-center mb-6">
                        <div className="relative inline-block">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <div className="text-center">
                                <div
                                  className={`text-3xl font-bold ${
                                    activityAnalytics.progressScore >= 80
                                      ? "text-green-600"
                                      : activityAnalytics.progressScore >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {activityAnalytics.progressScore}
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                  %
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Animated Ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-pulse"></div>
                        </div>

                        <p className="text-sm text-gray-600 mt-4 font-medium">
                          Izchillik ko'rsatkichi
                        </p>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="relative mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all duration-2000 ease-out ${
                              activityAnalytics.progressScore >= 80
                                ? "bg-gradient-to-r from-green-400 to-emerald-600"
                                : activityAnalytics.progressScore >= 60
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                  : "bg-gradient-to-r from-red-400 to-pink-500"
                            } shadow-lg`}
                            style={{
                              width: `${activityAnalytics.progressScore}%`,
                              boxShadow:
                                activityAnalytics.progressScore >= 80
                                  ? "0 0 20px rgba(34, 197, 94, 0.3)"
                                  : activityAnalytics.progressScore >= 60
                                    ? "0 0 20px rgba(251, 191, 36, 0.3)"
                                    : "0 0 20px rgba(239, 68, 68, 0.3)",
                            }}
                          ></div>
                        </div>

                        {/* Progress Glow Effect */}
                        <div
                          className={`absolute top-0 left-0 h-4 rounded-full opacity-50 ${
                            activityAnalytics.progressScore >= 80
                              ? "bg-green-400"
                              : activityAnalytics.progressScore >= 60
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          } blur-sm`}
                          style={{
                            width: `${activityAnalytics.progressScore}%`,
                          }}
                        ></div>
                      </div>

                      {/* Progress Tips */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          {activityAnalytics.progressScore >= 80
                            ? "🎉 Ajoyib! Davom eting!"
                            : activityAnalytics.progressScore >= 60
                              ? "👍 Yaxshi, biroz ko'proq harakat!"
                              : "💪 Mashqlarni muntazam qilib baring!"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
