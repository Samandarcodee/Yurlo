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
import { useUser, UserProfile as ContextUserProfile } from "@/contexts/UserContext";
import { useI18n, type Language } from "@/contexts/I18nContext";

export default function Profile() {
  const { user, updateUser, isLoading, clearUser } = useUser();
  const { language, setLanguage, t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<ContextUserProfile | null>(null);
  const [notifMeals, setNotifMeals] = useState<boolean>(true);
  const [notifWater, setNotifWater] = useState<boolean>(true);
  const [aiTips, setAiTips] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setEditedProfile(user);
      // Load settings from localStorage (per user)
      const uid = user.telegramId || "demo_user_123";
      const meals = localStorage.getItem(`notif_meals_${uid}`);
      const water = localStorage.getItem(`notif_water_${uid}`);
      const ai = localStorage.getItem(`ai_tips_${uid}`);
      setNotifMeals(meals ? meals === "true" : true);
      setNotifWater(water ? water === "true" : true);
      setAiTips(ai ? ai === "true" : true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!editedProfile) return;

    // Validation
    if (!editedProfile.name?.trim()) {
      setError("Ism kiritilishi shart");
      return;
    }
    if (!editedProfile.gender) {
      setError("Jinsni tanlang");
      return;
    }
    if (!editedProfile.birthYear || !editedProfile.height || !editedProfile.weight) {
      setError("Barcha maydonlar to'ldirilishi shart");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // BMR qayta hisoblash
      const age = new Date().getFullYear() - parseInt(editedProfile.birthYear || "1990");
      const heightNum = parseFloat(editedProfile.height || "170");
      const weightNum = parseFloat(editedProfile.weight || "70");

      let bmr = 0;
      if (editedProfile.gender === "male") {
        bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
      }

      const activityMultiplier: Record<string, number> = {
        low: 1.2,
        medium: 1.55,
        high: 1.725,
      };

      const dailyCalories = Math.round(
        bmr * activityMultiplier[editedProfile.activityLevel] || bmr * 1.2
      );

      const updatedProfile: ContextUserProfile = {
        ...editedProfile,
        age,
        bmr: Math.round(bmr),
        dailyCalories,
        createdAt: editedProfile.createdAt || new Date().toISOString(),
        isFirstTime: false,
      };

      await updateUser(updatedProfile);
      // Sync global i18n language with saved profile language
      if (updatedProfile.language) {
        setLanguage(updatedProfile.language as Language);
      }
      setEditing(false);
      setError(null);
    } catch (error) {
      console.error("Profil yangilanmadi:", error);
      setError("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    }
    setLoading(false);
  };

  const handleToggleSetting = (key: "meals" | "water" | "ai", value: boolean) => {
    if (!user) return;
    const uid = user.telegramId || "demo_user_123";
    if (key === "meals") {
      setNotifMeals(value);
      localStorage.setItem(`notif_meals_${uid}`, String(value));
    } else if (key === "water") {
      setNotifWater(value);
      localStorage.setItem(`notif_water_${uid}`, String(value));
    } else {
      setAiTips(value);
      localStorage.setItem(`ai_tips_${uid}`, String(value));
    }
  };

  const handleExport = () => {
    if (!user) return;
    const uid = user.telegramId || "demo_user_123";
    const data = {
      exportedAt: new Date().toISOString(),
      user,
      settings: {
        notifications: {
          meals: notifMeals,
          water: notifWater,
        },
        aiTips,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile_export_${uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearProfile = async () => {
    if (!user) return;
    const confirmed = window.confirm("Profilni tozalashni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.");
    if (!confirmed) return;
    // Clear local settings keys
    const uid = user.telegramId || "demo_user_123";
    localStorage.removeItem(`notif_meals_${uid}`);
    localStorage.removeItem(`notif_water_${uid}`);
    localStorage.removeItem(`ai_tips_${uid}`);
    clearUser();
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case "low":
      case "sedentary":
        return "🛌 Kam faol";
      case "medium":
      case "moderate":
      case "light":
        return "🚶 O'rtacha faol";
      case "high":
      case "active":
      case "very_active":
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
    if (bmi <= 0) return { label: "Ma'lumot yo'q", color: "text-gray-500" };
    if (bmi < 18.5) return { label: "Kam vazn", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Ortiqcha vazn", color: "text-yellow-600" };
    return { label: "Semizlik", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 theme-card-interactive shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">{t("general.loading")}</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
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
            <h3 className="text-xl font-bold mb-2 text-foreground">{t("profile.notFound")}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{t("profile.pleaseRegister")}</p>
            <Link to="/onboarding">
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200">
                {t("profile.register")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bmi = user.height && user.weight
    ? parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)
    : 0;
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 dark:from-background dark:via-card dark:to-muted/20 transition-colors duration-300">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up pt-4 sm:pt-6">
          <div className="relative inline-block">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 rounded-3xl border border-border/30 backdrop-blur-sm shadow-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                {t("profile.title")} 👤
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
                <span className="text-lg sm:text-xl font-bold">{t("profile.profileInfo")}</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!editing && user) {
                    setEditedProfile(user);
                  }
                  setEditing(!editing);
                }}
                className="border-mint-200 text-mint-600 hover:bg-white/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                {editing ? t("profile.cancel") : t("profile.edit")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
                {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t("profile.name")}</Label>
                    <Input
                      value={editedProfile?.name || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, name: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder={t("profile.namePlaceholder")}
                    />
                  </div>
                      <div>
                        <Label>{t("profile.gender")}</Label>
                        <Select
                          value={editedProfile?.gender || ""}
                          onValueChange={(value) =>
                            setEditedProfile((prev) =>
                              prev ? { ...prev, gender: value } as ContextUserProfile : null,
                            )
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t("onboarding.male")}</SelectItem>
                            <SelectItem value="female">{t("onboarding.female")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                    <Label>{t("onboarding.birthYear")}</Label>
                    <Input
                      type="number"
                      value={editedProfile?.birthYear || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, birthYear: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder="1990"
                      min="1900"
                          max={new Date().getFullYear().toString()}
                    />
                  </div>
                      <div>
                    <Label>{t("general.language")}</Label>
                        <Select
                          value={editedProfile?.language || language}
                          onValueChange={(value) => {
                            setEditedProfile((prev) => (prev ? { ...prev, language: value } : null));
                            setLanguage(value as Language);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uz">🇺🇿 O'zbek</SelectItem>
                            <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  <div>
                    <Label>{t("onboarding.height")}</Label>
                    <Input
                      type="number"
                      value={editedProfile?.height || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, height: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder="170"
                      min="100"
                      max="250"
                    />
                  </div>
                      <div>
                    <Label>{t("onboarding.weight")}</Label>
                    <Input
                      type="number"
                      value={editedProfile?.weight || ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, weight: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      placeholder="70"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t("onboarding.activity")}</Label>
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
                         <SelectItem value="low">🛌 {t("onboarding.low")}</SelectItem>
                         <SelectItem value="medium">🚶 {t("onboarding.medium")}</SelectItem>
                         <SelectItem value="high">🏃 {t("onboarding.high")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("onboarding.goal")}</Label>
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
                        <SelectItem value="lose">📉 {t("onboarding.lose")}</SelectItem>
                        <SelectItem value="maintain">⚖️ {t("onboarding.maintain")}</SelectItem>
                        <SelectItem value="gain">📈 {t("onboarding.gain")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>{t("onboarding.sleepTime")}</Label>
                        <Input
                          type="time"
                          value={editedProfile?.sleepTime || ""}
                          onChange={(e) =>
                            setEditedProfile((prev) =>
                              prev ? { ...prev, sleepTime: e.target.value } : null,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>{t("onboarding.wakeTime")}</Label>
                        <Input
                          type="time"
                          value={editedProfile?.wakeTime || ""}
                          onChange={(e) =>
                            setEditedProfile((prev) =>
                              prev ? { ...prev, wakeTime: e.target.value } : null,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-mint-500 to-water-500 hover:from-mint-600 hover:to-water-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t("general.loading") : t("general.save")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.name")}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {user.name}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.age")}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {user.age} {t("units.years")}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.height")}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {user.height} {t("units.cm")}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.weight")}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800">
                    {user.weight} {t("units.kg")}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.gender")}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-mint-800 capitalize">
                    {user.gender === 'male' ? t("onboarding.male") : user.gender === 'female' ? t("onboarding.female") : '—'}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.activity")}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-mint-800">
                    {getActivityLabel(user.activityLevel)}
                  </p>
                </div>

                <div className="space-y-2 p-3 sm:p-4 bg-white/40 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-mint-600" />
                    <span className="text-xs sm:text-sm text-mint-600 font-semibold">{t("profile.goal")}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-mint-800">
                    {getGoalLabel(user.goal)}
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
                {bmi > 0 ? bmi.toFixed(1) : "—"}
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
                {user.bmr}
              </p>
              <p className="text-sm text-muted-foreground">{t("units.kcalPerDay")}</p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover-lift rounded-xl sm:rounded-2xl overflow-hidden">
            <CardContent className="pt-6 text-center">
              <div className="inline-block p-3 bg-mint-100 rounded-full mb-3">
                <BarChart3 className="h-6 w-6 text-mint-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">{t("profile.dailyCaloriesTitle")}</h3>
              <p className="text-2xl font-bold text-foreground">
                {user.dailyCalories}
              </p>
              <p className="text-sm text-muted-foreground">{t("units.kcalPerDay")}</p>
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
              <span className="text-lg sm:text-xl font-bold">{t("profile.settings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                      <p className="font-medium">{t("general.language")}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.interfaceLanguage")}</p>
                </div>
              </div>
              <Badge variant="secondary">
                    {getLanguageLabel(user.language)}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.notifications")}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.notificationsSubtitle")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span>{t("profile.meals")}</span>
                  <Switch checked={notifMeals} onCheckedChange={(v) => handleToggleSetting("meals", v)} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{t("profile.water")}</span>
                  <Switch checked={notifWater} onCheckedChange={(v) => handleToggleSetting("water", v)} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.aiTipsTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.aiTipsDescription")}</p>
                </div>
              </div>
              <Switch checked={aiTips} onCheckedChange={(v) => handleToggleSetting("ai", v)} />
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={handleExport}>{t("profile.exportData")}</Button>
              <Button variant="destructive" onClick={handleClearProfile}>{t("profile.clearProfile")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
