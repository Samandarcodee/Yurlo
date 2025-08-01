import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Edit,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Target,
  Brain,
  Bell,
  Globe,
  BarChart3,
  Flame,
  Calculator,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";

interface UserProfile {
  name: string;
  gender: string;
  birthYear: string;
  age: number;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  sleepTime: string;
  wakeTime: string;
  language: string;
  bmr: number;
  dailyCalories: number;
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // localStorage'dan profil ma'lumotlarini olish
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
      setEditedProfile(profileData);
    }
  }, []);

  const handleSave = async () => {
    if (!editedProfile) return;

    setLoading(true);
    try {
      // BMR qayta hisoblash
      const age = new Date().getFullYear() - parseInt(editedProfile.birthYear);
      const heightNum = parseFloat(editedProfile.height);
      const weightNum = parseFloat(editedProfile.weight);

      let bmr = 0;
      if (editedProfile.gender === "male") {
        bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
      }

      const activityMultiplier = {
        low: 1.2,
        medium: 1.55,
        high: 1.725,
      };

      const dailyCalories = Math.round(
        bmr *
          activityMultiplier[
            editedProfile.activityLevel as keyof typeof activityMultiplier
          ],
      );

      const updatedProfile = {
        ...editedProfile,
        age,
        bmr: Math.round(bmr),
        dailyCalories,
      };

      // Backend'ga yuborish
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        setEditing(false);
      }
    } catch (error) {
      console.error("Profil yangilanmadi:", error);
    }
    setLoading(false);
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case "low":
        return "🛌 Kam faol";
      case "medium":
        return "🚶 O'rtacha faol";
      case "high":
        return "🏃 Juda faol";
      default:
        return level;
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "lose":
        return "📉 Vazn kamaytirish";
      case "maintain":
        return "⚖️ Vaznni saqlash";
      case "gain":
        return "📈 Vazn ko'paytirish";
      default:
        return goal;
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "uz":
        return "🇺🇿 O'zbek";
      case "ru":
        return "🇷🇺 Русский";
      case "en":
        return "🇺🇸 English";
      default:
        return lang;
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Kam vazn", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Ortiqcha vazn", color: "text-yellow-600" };
    return { label: "Semizlik", color: "text-red-600" };
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 theme-card-interactive shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="relative inline-block mb-6">
              <div className="p-4 bg-muted/50 rounded-full">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse border-2 border-background"></div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Profil topilmadi</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Iltimos, avval ro'yxatdan o'ting
            </p>
            <Link to="/onboarding">
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200">
                Ro'yxatdan o'tish
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bmi =
    parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2);
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 dark:from-background dark:via-card dark:to-muted/20 transition-colors duration-300">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up pt-4 sm:pt-6">
          <div className="relative inline-block">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 rounded-3xl border border-border/30 backdrop-blur-sm shadow-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Shaxsiy Kabinet 👤
              </h1>
            </div>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="gradient-mint border-mint-200 card-shadow-lg hover-lift animate-fade-in-up rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-mint-800">
                <div className="p-1.5 sm:p-2 bg-white/50 rounded-lg sm:rounded-xl">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-lg sm:text-xl font-bold">
                  Profil Ma'lumotlari
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
                className="border-mint-200 text-mint-600 hover:bg-white/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                {editing ? "Bekor qilish" : "Tahrirlash"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Ism</Label>
                    <Input
                      value={editedProfile?.name || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, name: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tug'ilgan yil</Label>
                    <Input
                      type="number"
                      value={editedProfile?.birthYear || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, birthYear: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bo'y (sm)</Label>
                    <Input
                      type="number"
                      value={editedProfile?.height || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, height: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Vazn (kg)</Label>
                    <Input
                      type="number"
                      value={editedProfile?.weight || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, weight: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Faollik darajasi</Label>
                    <Select
                      value={editedProfile?.activityLevel || ""}
                      onValueChange={(value) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, activityLevel: value } : null,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🛌 Kam faol</SelectItem>
                        <SelectItem value="medium">🚶 O'rtacha faol</SelectItem>
                        <SelectItem value="high">🏃 Juda faol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Maqsad</Label>
                    <Select
                      value={editedProfile?.goal || ""}
                      onValueChange={(value) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, goal: value } : null,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">
                          📉 Vazn kamaytirish
                        </SelectItem>
                        <SelectItem value="maintain">
                          ⚖️ Vaznni saqlash
                        </SelectItem>
                        <SelectItem value="gain">
                          📈 Vazn ko'paytirish
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-mint-500 to-water-500 hover:from-mint-600 hover:to-water-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Ism
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {profile.name}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Yosh
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {profile.age} yosh
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Bo'y
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {profile.height} sm
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Vazn
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {profile.weight} kg
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Faollik
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-mint-800">
                    {getActivityLabel(profile.activityLevel)}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">
                      Maqsad
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-mint-800">
                    {getGoalLabel(profile.goal)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
          <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
            <CardContent className="pt-6 text-center">
              <div className="inline-block p-3 bg-water-100 rounded-full mb-3">
                <Calculator className="h-6 w-6 text-water-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">BMI</h3>
              <p className="text-2xl font-bold text-foreground">
                {bmi.toFixed(1)}
              </p>
              <p className={`text-sm font-medium ${bmiCategory.color}`}>
                {bmiCategory.label}
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
            <CardContent className="pt-6 text-center">
              <div className="inline-block p-3 bg-health-100 rounded-full mb-3">
                <Flame className="h-6 w-6 text-health-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">BMR</h3>
              <p className="text-2xl font-bold text-foreground">
                {profile.bmr}
              </p>
              <p className="text-sm text-muted-foreground">kcal/kun</p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
            <CardContent className="pt-6 text-center">
              <div className="inline-block p-3 bg-mint-100 rounded-full mb-3">
                <BarChart3 className="h-6 w-6 text-mint-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">Kunlik Kaloriya</h3>
              <p className="text-2xl font-bold text-foreground">
                {profile.dailyCalories}
              </p>
              <p className="text-sm text-muted-foreground">kcal/kun</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="card-shadow-lg hover-lift animate-fade-in-up rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-water-100 rounded-lg sm:rounded-xl">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-water-600" />
              </div>
              <span className="text-lg sm:text-xl font-bold">Sozlamalar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Til</p>
                  <p className="text-sm text-muted-foreground">
                    Interfeys tili
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {getLanguageLabel(profile.language)}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Bildirishnomalar</p>
                  <p className="text-sm text-muted-foreground">
                    Ovqat va suv eslatmalari
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">AI Maslahatlar</p>
                  <p className="text-sm text-muted-foreground">
                    Shaxsiy AI tavsiyalari
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
