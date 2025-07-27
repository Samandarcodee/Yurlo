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
  const weightProgress = Math.abs(userData.currentWeight - userData.targetWeight) / userData.currentWeight * 100;

  return (
    <div className="p-4 space-y-6">
      {/* Header Greeting */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Salom, {userData.name} 👋
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Calorie Balance Card */}
      <Card className="bg-gradient-to-r from-mint-100 to-mint-50 border-mint-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-mint-800">
            <Target className="h-5 w-5" />
            Bugungi Kaloriya Balansi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-mint-600 font-medium">Iste'mol</p>
              <p className="text-2xl font-bold text-mint-800">{userData.caloriesConsumed.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-mint-600 font-medium">Yoqilgan</p>
              <p className="text-2xl font-bold text-mint-600">{userData.caloriesBurned}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-mint-600 font-medium">Qolgan</p>
              <p className={`text-2xl font-bold ${caloriesRemaining > 0 ? 'text-mint-500' : 'text-red-500'}`}>
                {caloriesRemaining > 0 ? caloriesRemaining : 0}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-mint-600">Maqsadga jarayon</span>
              <span className="text-mint-800 font-medium">
                {Math.round((userData.caloriesConsumed / userData.caloriesTarget) * 100)}%
              </span>
            </div>
            <Progress
              value={(userData.caloriesConsumed / userData.caloriesTarget) * 100}
              className="h-3 bg-mint-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Tezkor Amallar</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link to="/add-meal">
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground justify-start text-left">
              <Plus className="h-5 w-5 mr-3" />
              <div>
                <p className="font-semibold">Ovqat Qo'shish</p>
                <p className="text-xs opacity-90">Rasm yuklang yoki ovqat nomini kiriting</p>
              </div>
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14 flex-col gap-1 border-water-200 hover:bg-water-50">
              <Droplets className="h-5 w-5 text-water-500" />
              <span className="text-sm font-medium">Suv Qo'shish</span>
            </Button>

            <Button variant="outline" className="h-14 flex-col gap-1 border-mint-200 hover:bg-mint-50">
              <Activity className="h-5 w-5 text-mint-500" />
              <span className="text-sm font-medium">Faoliyat Qo'shish</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Bugungi Taraqqiyot</h2>

        {/* Water Intake */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-water-500" />
                <span className="font-medium">Suv Iste'moli</span>
              </div>
              <Badge variant="secondary" className="bg-water-100 text-water-700">
                {userData.waterIntake}/{userData.waterTarget} stakan
              </Badge>
            </div>
            <Progress value={waterProgress} className="h-2 bg-water-100" />
            <p className="text-sm text-muted-foreground mt-2">
              {waterProgress >= 100 ? "Ajoyib! Siz kunlik maqsadingizga erishdingiz!" :
               `Maqsadga erishish uchun yana ${userData.waterTarget - userData.waterIntake} stakan kerak`}
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-sunshine-500" />
                <span className="font-medium">Qadamlar</span>
              </div>
              <Badge variant="secondary" className="bg-sunshine-100 text-sunshine-700">
                {userData.stepsToday.toLocaleString()}/{userData.stepsTarget.toLocaleString()}
              </Badge>
            </div>
            <Progress value={stepsProgress} className="h-2 bg-sunshine-100" />
            <p className="text-sm text-muted-foreground mt-2">
              {stepsProgress >= 100 ? "Zo'r! Siz kunlik qadamlar maqsadini oshib ketdingiz!" :
               `Maqsadga erishish uchun yana ${(userData.stepsTarget - userData.stepsToday).toLocaleString()} qadam kerak`}
            </p>
          </CardContent>
        </Card>

        {/* Weight Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-mint-500" />
                <span className="font-medium">Vazn Taraqqiyoti</span>
              </div>
              <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                {userData.currentWeight} kg
              </Badge>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Hozirgi: {userData.currentWeight} kg</span>
              <span>Maqsad: {userData.targetWeight} kg</span>
            </div>
            <p className="text-sm text-mint-600 mt-2 font-medium">
              {userData.currentWeight > userData.targetWeight ?
                `${(userData.currentWeight - userData.targetWeight).toFixed(1)} kg kamaytirishingiz kerak` :
                "Maqsadga erishdingiz! 🎉"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary Link */}
      <Card className="bg-gradient-to-r from-water-50 to-mint-50 border-mint-200">
        <CardContent className="pt-6">
          <Link to="/analytics" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-mint-600" />
              <div>
                <h3 className="font-semibold text-mint-800">Tahlilni Ko'rish</h3>
                <p className="text-sm text-mint-600">Haftalik taraqqiyotingizni kuzating</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-mint-600 hover:text-mint-700">
              Ko'rish →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
