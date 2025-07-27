import { Plus, Droplets, Activity, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  // Mock data - in real app this would come from state/API
  const userData = {
    name: "Samandar",
    caloriesConsumed: 1247,
    caloriesTarget: 2100,
    caloriesBurned: 312,
    waterIntake: 6,
    waterTarget: 8,
    stepsToday: 7234,
    stepsTarget: 10000,
    currentWeight: 72.5,
    targetWeight: 70.0,
  };

  const caloriesRemaining = userData.caloriesTarget - userData.caloriesConsumed + userData.caloriesBurned;
  const waterProgress = (userData.waterIntake / userData.waterTarget) * 100;
  const stepsProgress = (userData.stepsToday / userData.stepsTarget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Header Greeting */}
        <div className="text-center space-y-2 sm:space-y-3 animate-fade-in-up pt-2 sm:pt-4">
          <div className="inline-block p-2 sm:p-3 bg-gradient-to-r from-mint-100 to-water-100 rounded-full mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-mint-600 to-water-600 bg-clip-text text-transparent">
              Salom, {userData.name} 👋
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium tracking-wide px-4">
            {new Date().toLocaleDateString('uz-UZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Calorie Balance Card */}
        <Card className="gradient-mint border-mint-200 card-shadow-lg hover-lift animate-fade-in-up rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-mint-800">
              <div className="p-1.5 sm:p-2 bg-white/50 rounded-lg sm:rounded-xl">
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-lg sm:text-xl font-bold">Bugungi Kaloriya Balansi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                <p className="text-xs sm:text-sm text-mint-600 font-semibold">Iste'mol</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-mint-800">{userData.caloriesConsumed.toLocaleString()}</p>
              </div>
              <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                <p className="text-xs sm:text-sm text-mint-600 font-semibold">Yoqilgan</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-mint-600">{userData.caloriesBurned}</p>
              </div>
              <div className="space-y-1 sm:space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                <p className="text-xs sm:text-sm text-mint-600 font-semibold">Qolgan</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${caloriesRemaining > 0 ? 'text-mint-500' : 'text-red-500'}`}>
                  {caloriesRemaining > 0 ? caloriesRemaining : 0}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-mint-600 font-semibold">Maqsadga jarayon</span>
                <span className="text-mint-800 font-bold text-base sm:text-lg">
                  {Math.round((userData.caloriesConsumed / userData.caloriesTarget) * 100)}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={(userData.caloriesConsumed / userData.caloriesTarget) * 100}
                  className="h-3 sm:h-4 bg-white/50 rounded-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-mint-400 to-mint-500 rounded-full"
                     style={{ width: `${(userData.caloriesConsumed / userData.caloriesTarget) * 100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-mint-500 to-water-500 rounded-full"></div>
            Tezkor Amallar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <Link to="/add-meal">
              <Button className="w-full h-14 sm:h-16 lg:h-18 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 justify-start text-left rounded-xl sm:rounded-2xl">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl mr-3 sm:mr-4">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg">Ovqat Qo'shish</p>
                  <p className="text-xs sm:text-sm opacity-90">Rasm yuklang yoki ovqat nomini kiriting</p>
                </div>
              </Button>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button variant="outline" className="h-14 sm:h-16 flex-col gap-1 sm:gap-2 border-water-200 hover:bg-water-50 rounded-xl sm:rounded-2xl card-shadow hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="p-1.5 sm:p-2 bg-water-100 rounded-lg sm:rounded-xl">
                  <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-water-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-water-700">Suv Qo'shish</span>
              </Button>

              <Button variant="outline" className="h-14 sm:h-16 flex-col gap-1 sm:gap-2 border-mint-200 hover:bg-mint-50 rounded-xl sm:rounded-2xl card-shadow hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="p-1.5 sm:p-2 bg-mint-100 rounded-lg sm:rounded-xl">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-mint-600" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-mint-700">Faoliyat Qo'shish</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-mint-500 to-water-500 rounded-full"></div>
            Bugungi Taraqqiyot
          </h2>

          {/* Water Intake */}
          <Card className="card-shadow hover-lift rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-water-100 rounded-xl">
                    <Droplets className="h-6 w-6 text-water-600" />
                  </div>
                  <span className="font-bold text-lg">Suv Iste'moli</span>
                </div>
                <Badge className="bg-water-100 text-water-700 px-3 py-1 rounded-full font-bold">
                  {userData.waterIntake}/{userData.waterTarget} stakan
                </Badge>
              </div>
              <div className="relative mb-3">
                <Progress value={waterProgress} className="h-3 bg-water-50 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-water-400 to-water-500 rounded-full" 
                     style={{ width: `${waterProgress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {waterProgress >= 100 ? "🎉 Ajoyib! Siz kunlik maqsadingizga erishdingiz!" :
                 `💧 Maqsadga erishish uchun yana ${userData.waterTarget - userData.waterIntake} stakan kerak`}
              </p>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card className="card-shadow hover-lift rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-health-100 rounded-xl">
                    <Activity className="h-6 w-6 text-health-600" />
                  </div>
                  <span className="font-bold text-lg">Qadamlar</span>
                </div>
                <Badge className="bg-health-100 text-health-700 px-3 py-1 rounded-full font-bold">
                  {userData.stepsToday.toLocaleString()}/{userData.stepsTarget.toLocaleString()}
                </Badge>
              </div>
              <div className="relative mb-3">
                <Progress value={stepsProgress} className="h-3 bg-health-50 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-health-400 to-health-500 rounded-full" 
                     style={{ width: `${stepsProgress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {stepsProgress >= 100 ? "🚀 Zo'r! Siz kunlik qadamlar maqsadini oshib ketdingiz!" :
                 `👟 Maqsadga erishish uchun yana ${(userData.stepsTarget - userData.stepsToday).toLocaleString()} qadam kerak`}
              </p>
            </CardContent>
          </Card>

          {/* Weight Progress */}
          <Card className="card-shadow hover-lift rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mint-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-mint-600" />
                  </div>
                  <span className="font-bold text-lg">Vazn Taraqqiyoti</span>
                </div>
                <Badge className="bg-mint-100 text-mint-700 px-3 py-1 rounded-full font-bold">
                  {userData.currentWeight} kg
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-3">
                <span className="font-semibold">Hozirgi: {userData.currentWeight} kg</span>
                <span className="font-semibold">Maqsad: {userData.targetWeight} kg</span>
              </div>
              <p className="text-sm text-mint-600 font-bold bg-mint-50 p-3 rounded-xl">
                {userData.currentWeight > userData.targetWeight ?
                  `📉 ${(userData.currentWeight - userData.targetWeight).toFixed(1)} kg kamaytirishingiz kerak` :
                  "🎉 Maqsadga erishdingiz!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary Link */}
        <Card className="gradient-water border-water-200 card-shadow-lg hover-lift animate-fade-in-up rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <Link to="/analytics" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/50 rounded-xl">
                  <Calendar className="h-8 w-8 text-water-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-water-800">Tahlilni Ko'rish</h3>
                  <p className="text-sm text-water-600 font-medium">Haftalik taraqqiyotingizni kuzating</p>
                </div>
              </div>
              <Button className="bg-white/80 text-water-700 hover:bg-white font-bold px-6 py-2 rounded-full shadow-md">
                Ko'rish →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
