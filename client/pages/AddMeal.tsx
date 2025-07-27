import { useState } from "react";
import { Camera, Upload, Search, Clock, Utensils, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddMeal() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [portionSize, setPortionSize] = useState([1]);
  const [mealTime, setMealTime] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // Simulate AI analysis
        setTimeout(() => {
          setIsAnalyzing(true);
          setTimeout(() => {
            setIsAnalyzing(false);
            setAiAnalysis({
              calories: 420,
              protein: 25,
              carbs: 45,
              fat: 12,
              confidence: 85
            });
            setMealName("Grilled Chicken Salad");
          }, 2000);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextAnalysis = () => {
    if (mealName.trim()) {
      setIsAnalyzing(true);
      // Simulate AI analysis for text input
      setTimeout(() => {
        setIsAnalyzing(false);
        setAiAnalysis({
          calories: 380,
          protein: 22,
          carbs: 35,
          fat: 15,
          confidence: 78
        });
      }, 1500);
    }
  };

  const saveMeal = () => {
    // Here you would save the meal data
    console.log("Saving meal:", {
      name: mealName,
      portion: portionSize[0],
      time: mealTime,
      nutrition: aiAnalysis,
      image: selectedImage
    });
    // Show success message and navigate back
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Add Meal</h1>
        <p className="text-muted-foreground">Upload a photo or enter meal details</p>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <Label className="text-base font-medium">How would you like to log your meal?</Label>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Photo Upload */}
          <Card className="border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Take a Photo</h3>
                    <p className="text-sm text-muted-foreground">AI will analyze your meal automatically</p>
                  </div>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </CardContent>
          </Card>

          {/* Text Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-full">
                    <Search className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="meal-name">Enter meal name</Label>
                    <Input
                      id="meal-name"
                      placeholder="e.g., Chicken Caesar Salad"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleTextAnalysis} 
                  variant="outline" 
                  className="w-full"
                  disabled={!mealName.trim() || isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Uploaded Image Preview */}
      {selectedImage && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Uploaded Image</Label>
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Meal" 
                  className="w-full h-48 object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin mb-2">
                        <Zap className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm">AI is analyzing your meal...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <Card className="bg-gradient-to-r from-health-100 to-health-50 border-health-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-health-800">
              <CheckCircle className="h-5 w-5" />
              AI Analysis Results
              <Badge variant="secondary" className="ml-auto bg-health-200 text-health-800">
                {aiAnalysis.confidence}% confident
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <p className="text-2xl font-bold text-health-800">{aiAnalysis.calories}</p>
                <p className="text-sm text-health-600">Calories</p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <p className="text-2xl font-bold text-health-800">{aiAnalysis.protein}g</p>
                <p className="text-sm text-health-600">Protein</p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <p className="text-2xl font-bold text-health-800">{aiAnalysis.carbs}g</p>
                <p className="text-sm text-health-600">Carbs</p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <p className="text-2xl font-bold text-health-800">{aiAnalysis.fat}g</p>
                <p className="text-sm text-health-600">Fat</p>
              </div>
            </div>

            {/* Meal Details Form */}
            <div className="space-y-4 pt-4 border-t border-health-200">
              <div className="space-y-2">
                <Label htmlFor="meal-name-edit">Meal Name</Label>
                <Input
                  id="meal-name-edit"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Enter or edit meal name"
                />
              </div>

              <div className="space-y-2">
                <Label>Portion Size: {portionSize[0]} serving{portionSize[0] !== 1 ? 's' : ''}</Label>
                <Slider
                  value={portionSize}
                  onValueChange={setPortionSize}
                  max={3}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meal Time</Label>
                <Select value={mealTime} onValueChange={setMealTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="snack">🍎 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about your meal..."
                  className="h-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {aiAnalysis && (
        <div className="fixed bottom-20 left-4 right-4">
          <Button 
            onClick={saveMeal}
            className="w-full h-12 text-lg font-semibold"
            disabled={!mealTime}
          >
            <Utensils className="h-5 w-5 mr-2" />
            Save Meal ({Math.round(aiAnalysis.calories * portionSize[0])} cal)
          </Button>
        </div>
      )}
    </div>
  );
}
