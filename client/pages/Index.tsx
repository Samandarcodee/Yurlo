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
          Hi, {userData.name} 👋
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Calorie Balance Card */}
      <Card className="bg-gradient-to-r from-health-100 to-health-50 border-health-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-health-800">
            <Target className="h-5 w-5" />
            Today's Calorie Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-health-600 font-medium">Consumed</p>
              <p className="text-2xl font-bold text-health-800">{userData.caloriesConsumed.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-health-600 font-medium">Burned</p>
              <p className="text-2xl font-bold text-health-600">{userData.caloriesBurned}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-health-600 font-medium">Remaining</p>
              <p className={`text-2xl font-bold ${caloriesRemaining > 0 ? 'text-health-500' : 'text-red-500'}`}>
                {caloriesRemaining > 0 ? caloriesRemaining : 0}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-health-600">Progress to goal</span>
              <span className="text-health-800 font-medium">
                {Math.round((userData.caloriesConsumed / userData.caloriesTarget) * 100)}%
              </span>
            </div>
            <Progress 
              value={(userData.caloriesConsumed / userData.caloriesTarget) * 100} 
              className="h-3 bg-health-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link to="/add-meal">
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground justify-start text-left">
              <Plus className="h-5 w-5 mr-3" />
              <div>
                <p className="font-semibold">Add Meal</p>
                <p className="text-xs opacity-90">Upload photo or enter food name</p>
              </div>
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14 flex-col gap-1 border-water-200 hover:bg-water-50">
              <Droplets className="h-5 w-5 text-water-500" />
              <span className="text-sm font-medium">Log Water</span>
            </Button>
            
            <Button variant="outline" className="h-14 flex-col gap-1 border-health-200 hover:bg-health-50">
              <Activity className="h-5 w-5 text-health-500" />
              <span className="text-sm font-medium">Add Activity</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Today's Progress</h2>
        
        {/* Water Intake */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-water-500" />
                <span className="font-medium">Water Intake</span>
              </div>
              <Badge variant="secondary" className="bg-water-100 text-water-700">
                {userData.waterIntake}/{userData.waterTarget} glasses
              </Badge>
            </div>
            <Progress value={waterProgress} className="h-2 bg-water-100" />
            <p className="text-sm text-muted-foreground mt-2">
              {waterProgress >= 100 ? "Great job! You've reached your daily goal!" : 
               `${userData.waterTarget - userData.waterIntake} more glasses to reach your goal`}
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-health-500" />
                <span className="font-medium">Steps</span>
              </div>
              <Badge variant="secondary" className="bg-health-100 text-health-700">
                {userData.stepsToday.toLocaleString()}/{userData.stepsTarget.toLocaleString()}
              </Badge>
            </div>
            <Progress value={stepsProgress} className="h-2 bg-health-100" />
            <p className="text-sm text-muted-foreground mt-2">
              {stepsProgress >= 100 ? "Excellent! You've exceeded your daily step goal!" : 
               `${(userData.stepsTarget - userData.stepsToday).toLocaleString()} more steps to reach your goal`}
            </p>
          </CardContent>
        </Card>

        {/* Weight Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-health-500" />
                <span className="font-medium">Weight Progress</span>
              </div>
              <Badge variant="secondary" className="bg-health-100 text-health-700">
                {userData.currentWeight} kg
              </Badge>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Current: {userData.currentWeight} kg</span>
              <span>Target: {userData.targetWeight} kg</span>
            </div>
            <p className="text-sm text-health-600 mt-2 font-medium">
              {userData.currentWeight > userData.targetWeight ? 
                `${(userData.currentWeight - userData.targetWeight).toFixed(1)} kg to lose` :
                "Goal achieved! 🎉"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary Link */}
      <Card className="bg-gradient-to-r from-accent to-secondary border-health-200">
        <CardContent className="pt-6">
          <Link to="/analytics" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-health-600" />
              <div>
                <h3 className="font-semibold text-health-800">View Analytics</h3>
                <p className="text-sm text-health-600">Track your weekly progress</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-health-600 hover:text-health-700">
              View →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
