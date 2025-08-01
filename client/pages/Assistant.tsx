import { useEffect } from "react";
import {
  MessageCircle,
  Lightbulb,
  Heart,
  Zap,
  Droplets,
  Utensils,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useAIRecommendations } from "@/contexts/UserContext";

export default function Assistant() {
  const { user } = useUser();
  const { recommendations, loading, fetchRecommendations } =
    useAIRecommendations();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/60 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">AI Yordamchi</h1>
            <p className="text-muted-foreground">Shaxsiy tavsiyalar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 dark:from-background dark:via-card dark:to-muted/20 transition-colors duration-300">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up pt-4 sm:pt-6">
          <div className="relative inline-block">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 rounded-3xl border border-border/30 backdrop-blur-sm shadow-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                AI Yordamchi
              </h1>
              <div className="flex justify-center mt-2">
                <div className="text-3xl animate-bounce">🤖</div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-background"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm sm:text-base font-medium px-4">
              {user?.name} uchun shaxsiy tavsiyalar
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-primary">AI aktiv</span>
            </div>
          </div>
        </div>

        {recommendations ? (
          <>
            {/* Enhanced Daily Tips */}
            <Card className="theme-card-interactive bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800 shadow-xl animate-fade-in-up rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 sm:gap-4 text-blue-700 dark:text-blue-300">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-bold block">
                      Bugungi Maslahatlar
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      AI tomonidan tavsiya etilgan
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.dailyTips?.map(
                  (tip: string, index: number) => (
                    <div key={index} className="group p-4 bg-white/60 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:bg-white/80 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{index + 1}</span>
                        </div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Enhanced Calorie Adjustment */}
            <Card className="theme-card-interactive bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-green-700 dark:text-green-300">Kaloriya Tavsiyasi</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Shaxsiy rejim</p>
                  </div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 leading-relaxed">
                    {recommendations.calorieAdjustment}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Water Reminder */}
            <Card className="theme-card-interactive bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 border-cyan-200 dark:border-cyan-800 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-cyan-700 dark:text-cyan-300">Suv Eslatmasi</h3>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Gidratatsiya nazorati</p>
                  </div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-cyan-900/20 rounded-xl border border-cyan-200/50 dark:border-cyan-700/50">
                  <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200 leading-relaxed">
                    {recommendations.waterReminder}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Exercise Advice */}
            <Card className="theme-card-interactive bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-pink-950/30 border-orange-200 dark:border-orange-800 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 sm:gap-4 text-orange-700 dark:text-orange-300">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-bold block">
                      Jismoniy Faollik
                    </span>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Sport va harakat
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.exerciseAdvice?.map(
                  (advice: string, index: number) => (
                    <div key={index} className="group p-4 bg-white/60 dark:bg-orange-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 hover:bg-white/80 dark:hover:bg-orange-900/30 transition-all duration-200 hover:scale-105">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mt-0.5">
                          <Activity className="w-3 h-3 text-orange-600 dark:text-orange-300" />
                        </div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200 leading-relaxed">
                          {advice}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Enhanced Nutrition Advice */}
            <Card className="theme-card-interactive bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-lime-950/30 border-emerald-200 dark:border-emerald-800 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 sm:gap-4 text-emerald-700 dark:text-emerald-300">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-bold block">
                      Ovqatlanish Maslahatlari
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Sog'lom oziqlanish
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.nutritionAdvice?.map(
                  (advice: string, index: number) => (
                    <div key={index} className="group p-4 bg-white/60 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:bg-white/80 dark:hover:bg-emerald-900/30 transition-all duration-200 hover:scale-105">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mt-0.5">
                          <Heart className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                          {advice}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="theme-card bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/30 dark:via-gray-950/30 dark:to-zinc-950/30 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="relative inline-block">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full border border-border/30">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-foreground">
                  AI Tavsiyalar Yuklanmoqda
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                  Shaxsiy tavsiyalarni olish uchun "Yangi Tavsiyalar Olish" tugmasini bosing
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Refresh Button */}
        <div className="text-center pt-6">
          <Button
            onClick={fetchRecommendations}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <Zap className={`h-5 w-5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:scale-110'}`} />
              <span className="font-semibold text-base">
                {loading ? 'Yuklanmoqda...' : 'Yangi Tavsiyalar Olish'}
              </span>
            </div>
            {!loading && (
              <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
