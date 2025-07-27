import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Ruler, Weight, Activity, Target, Clock, Globe } from "lucide-react";

interface OnboardingData {
  name: string;
  gender: string;
  birthYear: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  sleepTime: string;
  wakeTime: string;
  language: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    name: "Samandar", // Telegramdan olinadi
    gender: "",
    birthYear: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    sleepTime: "",
    wakeTime: "",
    language: "uz"
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      // BMR hisobash
      const age = new Date().getFullYear() - parseInt(formData.birthYear);
      const heightNum = parseFloat(formData.height);
      const weightNum = parseFloat(formData.weight);
      
      let bmr = 0;
      if (formData.gender === "male") {
        bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * age);
      }

      // Faollik koeffitsienti
      const activityMultiplier = {
        low: 1.2,
        medium: 1.55,
        high: 1.725
      };

      const dailyCalories = Math.round(bmr * activityMultiplier[formData.activityLevel as keyof typeof activityMultiplier]);

      const userData = {
        ...formData,
        age,
        bmr: Math.round(bmr),
        dailyCalories,
        isFirstTime: false,
        createdAt: new Date().toISOString()
      };

      // Backend'ga yuborish
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // localStorage'ga saqlash
        localStorage.setItem('userProfile', JSON.stringify(userData));
        navigate('/');
      } else {
        console.error('Ma\'lumotlar saqlanmadi');
      }
    } catch (error) {
      console.error('Xatolik:', error);
    }
    setLoading(false);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.gender && formData.birthYear;
      case 2:
        return formData.height && formData.weight;
      case 3:
        return formData.activityLevel && formData.goal;
      case 4:
        return formData.language;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-mint-600">
              Qadam {currentStep} / {totalSteps}
            </span>
            <span className="text-sm font-medium text-mint-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-mint-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-mint-500 to-water-500 transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="card-shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-mint-100 to-water-100 pb-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-mint-600 to-water-600 bg-clip-text text-transparent">
              Caloria AI'ga Xush Kelibsiz! 🎉
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sizga moslashtirilgan tavsiyalar uchun ma'lumotlaringizni to'ldiring
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-block p-3 bg-mint-100 rounded-full mb-3">
                    <User className="h-8 w-8 text-mint-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Asosiy Ma'lumotlar</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ism</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      readOnly
                      className="bg-muted/50 mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Telegramdan avtomatik olingan
                    </p>
                  </div>

                  <div>
                    <Label>Jinsingiz</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-mint-50">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="flex-1 cursor-pointer">👨 Erkak</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-mint-50">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="flex-1 cursor-pointer">👩 Ayol</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="birthYear">Tug'ilgan yil</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="birthYear"
                        type="number"
                        placeholder="1995"
                        value={formData.birthYear}
                        onChange={(e) => updateFormData('birthYear', e.target.value)}
                        className="pl-10"
                        min="1950"
                        max={new Date().getFullYear() - 10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Physical Measurements */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-block p-3 bg-water-100 rounded-full mb-3">
                    <Ruler className="h-8 w-8 text-water-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Jismoniy O'lchamlar</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Bo'yingiz (sm)</Label>
                    <div className="relative mt-1">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => updateFormData('height', e.target.value)}
                        className="pl-10"
                        min="100"
                        max="250"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight">Vazningiz (kg)</Label>
                    <div className="relative mt-1">
                      <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => updateFormData('weight', e.target.value)}
                        className="pl-10"
                        min="30"
                        max="300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Goals & Activity */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-block p-3 bg-health-100 rounded-full mb-3">
                    <Target className="h-8 w-8 text-health-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Maqsad va Faollik</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Faollik darajangiz</Label>
                    <Select value={formData.activityLevel} onValueChange={(value) => updateFormData('activityLevel', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Faollik darajasini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🛌 Kam faol (ofis ishi)</SelectItem>
                        <SelectItem value="medium">🚶 O'rtacha faol (haftada 3-4 sport)</SelectItem>
                        <SelectItem value="high">🏃 Juda faol (har kuni sport)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Maqsadingiz</Label>
                    <Select value={formData.goal} onValueChange={(value) => updateFormData('goal', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Maqsadingizni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">📉 Vazn kamaytirish</SelectItem>
                        <SelectItem value="maintain">⚖️ Vaznni saqlash</SelectItem>
                        <SelectItem value="gain">📈 Vazn ko'paytirish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sleepTime">Uxlash vaqti (ixtiyoriy)</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="sleepTime"
                          type="time"
                          value={formData.sleepTime}
                          onChange={(e) => updateFormData('sleepTime', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="wakeTime">Uyg'onish vaqti (ixtiyoriy)</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="wakeTime"
                          type="time"
                          value={formData.wakeTime}
                          onChange={(e) => updateFormData('wakeTime', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Language & Finish */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-block p-3 bg-water-100 rounded-full mb-3">
                    <Globe className="h-8 w-8 text-water-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Tugallash</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Til</Label>
                    <Select value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tilni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uz">🇺🇿 O'zbek</SelectItem>
                        <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-mint-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-mint-800 mb-2">✨ Siz uchun hisoblangan:</h4>
                    <div className="space-y-1 text-sm text-mint-700">
                      <p>📅 Yosh: {formData.birthYear ? new Date().getFullYear() - parseInt(formData.birthYear) : '-'} yosh</p>
                      <p>🔥 BMI: {formData.height && formData.weight ? 
                        (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1) : '-'}</p>
                      <p>📊 Kunlik kaloriya tavsiyasi hisoblash mumkin bo'ladi</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12 border-mint-200 text-mint-600 hover:bg-mint-50"
                >
                  ← Orqaga
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex-1 h-12 bg-gradient-to-r from-mint-500 to-water-500 hover:from-mint-600 hover:to-water-600 text-white font-semibold"
                >
                  Keyingi →
                </Button>
              ) : (
                <Button
                  onClick={submitForm}
                  disabled={!isStepValid() || loading}
                  className="flex-1 h-12 bg-gradient-to-r from-mint-500 to-water-500 hover:from-mint-600 hover:to-water-600 text-white font-semibold"
                >
                  {loading ? "Saqlanmoqda..." : "Tugallash ✅"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
