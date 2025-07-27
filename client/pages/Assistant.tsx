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
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">AI Yordamchi</h1>
          <p className="text-muted-foreground">
            Shaxsiy tavsiyalar yuklanmoqda...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-water-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3 animate-fade-in-up pt-2 sm:pt-4">
          <div className="inline-block p-2 sm:p-3 bg-gradient-to-r from-water-100 to-mint-100 rounded-full mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-water-600 to-mint-600 bg-clip-text text-transparent">
              AI Yordamchi 🤖
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium px-4">
            {user?.name} uchun shaxsiy tavsiyalar
          </p>
        </div>

        {recommendations && (
          <>
            {/* Daily Tips */}
            <Card className="gradient-water border-water-200 card-shadow-lg hover-lift animate-fade-in-up rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-water-800">
                  <div className="p-1.5 sm:p-2 bg-white/50 rounded-lg sm:rounded-xl">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">
                    Bugungi Maslahatlar
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.dailyTips?.map(
                  (tip: string, index: number) => (
                    <div key={index} className="p-3 bg-white/40 rounded-xl">
                      <p className="text-sm font-medium text-water-800">
                        {tip}
                      </p>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Calorie Adjustment */}
            <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-mint-100 rounded-xl">
                    <Utensils className="h-6 w-6 text-mint-600" />
                  </div>
                  <h3 className="font-bold text-lg">Kaloriya Tavsiyasi</h3>
                </div>
                <p className="text-sm font-medium bg-mint-50 p-3 rounded-xl text-mint-800">
                  {recommendations.calorieAdjustment}
                </p>
              </CardContent>
            </Card>

            {/* Water Reminder */}
            <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-water-100 rounded-xl">
                    <Droplets className="h-6 w-6 text-water-600" />
                  </div>
                  <h3 className="font-bold text-lg">Suv Eslatmasi</h3>
                </div>
                <p className="text-sm font-medium bg-water-50 p-3 rounded-xl text-water-800">
                  {recommendations.waterReminder}
                </p>
              </CardContent>
            </Card>

            {/* Exercise Advice */}
            <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-health-100 rounded-lg sm:rounded-xl">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-health-600" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">
                    Jismoniy Faollik
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.exerciseAdvice?.map(
                  (advice: string, index: number) => (
                    <div key={index} className="p-3 bg-health-50 rounded-xl">
                      <p className="text-sm font-medium text-health-800">
                        {advice}
                      </p>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Nutrition Advice */}
            <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-mint-100 rounded-lg sm:rounded-xl">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-mint-600" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">
                    Ovqatlanish Maslahatlari
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.nutritionAdvice?.map(
                  (advice: string, index: number) => (
                    <div key={index} className="p-3 bg-mint-50 rounded-xl">
                      <p className="text-sm font-medium text-mint-800">
                        {advice}
                      </p>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Refresh Button */}
        <div className="text-center pt-4">
          <Button
            onClick={fetchRecommendations}
            disabled={loading}
            className="bg-gradient-to-r from-water-500 to-mint-500 hover:from-water-600 hover:to-mint-600"
          >
            <Zap className="h-4 w-4 mr-2" />
            Yangi Tavsiyalar Olish
          </Button>
        </div>
      </div>
    </div>
  );
}
