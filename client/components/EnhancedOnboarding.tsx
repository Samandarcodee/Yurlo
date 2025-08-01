import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { useTelegram } from "@/hooks/use-telegram";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Target,
  Clock,
  Globe,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react";
import { z } from "zod";

// === VALIDATION SCHEMAS ===
const PersonalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta harf bo'lishi kerak")
    .max(50, "Ism 50 ta harfdan oshmasligi kerak"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Jinsiyatni tanlang" }),
  }),
  birthYear: z.string().refine((val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear - 13;
  }, "Yoshingiz 13 dan katta bo'lishi kerak"),
});

const BodyMetricsSchema = z.object({
  height: z.string().refine((val) => {
    const height = parseFloat(val);
    return height >= 100 && height <= 250;
  }, "Bo'y 100-250 sm oralig'ida bo'lishi kerak"),
  weight: z.string().refine((val) => {
    const weight = parseFloat(val);
    return weight >= 30 && weight <= 300;
  }, "Vazn 30-300 kg oralig'ida bo'lishi kerak"),
  activityLevel: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Faollik darajasini tanlang" }),
  }),
});

const HealthGoalsSchema = z.object({
  goal: z.enum(["lose", "maintain", "gain"], {
    errorMap: () => ({ message: "Maqsadni tanlang" }),
  }),
  targetWeight: z.string().optional(),
  timeline: z.enum(["1month", "3months", "6months", "1year"]).optional(),
});

const PreferencesSchema = z.object({
  sleepTime: z.string().optional(),
  wakeTime: z.string().optional(),
  language: z.enum(["uz", "ru", "en"]),
  notifications: z.boolean().optional(),
});

// === INTERFACE DEFINITIONS ===
interface OnboardingData {
  name: string;
  gender: string;
  birthYear: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
  targetWeight?: string;
  timeline?: string;
  sleepTime?: string;
  wakeTime?: string;
  language: string;
  notifications?: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  isOptional?: boolean;
  validation?: z.ZodSchema;
}

// === STEP DEFINITIONS ===
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Xush kelibsiz!",
    description: "Caloria AI bilan sog'liq sayohatingizni boshlang",
    icon: Sparkles,
    progress: 15,
  },
  {
    id: "personal-info",
    title: "Shaxsiy ma'lumotlar",
    description: "Ismingiz, yoshingiz va jinsiyatingiz",
    icon: User,
    progress: 35,
    validation: PersonalInfoSchema,
  },
  {
    id: "body-metrics",
    title: "Tana o'lchamlari",
    description: "Bo'y, vazn va faollik darajangiz",
    icon: Ruler,
    progress: 55,
    validation: BodyMetricsSchema,
  },
  {
    id: "health-goals",
    title: "Sog'liq maqsadlari",
    description: "Nimaga erishmoqchisiz?",
    icon: Target,
    progress: 75,
    validation: HealthGoalsSchema,
  },
  {
    id: "preferences",
    title: "Shaxsiy sozlamalar",
    description: "Uyqu rejimi va tilni sozlang",
    icon: Clock,
    progress: 90,
    isOptional: true,
    validation: PreferencesSchema,
  },
  {
    id: "completion",
    title: "Tayyor!",
    description: "Profilingiz muvaffaqiyatli sozlandi",
    icon: CheckCircle,
    progress: 100,
  },
];

// === ANIMATION VARIANTS ===
const stepVariants = {
  enter: {
    x: 300,
    opacity: 0,
    scale: 0.8,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    scale: 0.8,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const progressVariants = {
  initial: { width: 0 },
  animate: {
    width: "100%",
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
};

// === MAIN COMPONENT ===
export default function EnhancedOnboarding() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const { user: telegramUser, hapticFeedback } = useTelegram();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    name: telegramUser?.first_name || "",
    gender: "",
    birthYear: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    targetWeight: "",
    timeline: "",
    sleepTime: "",
    wakeTime: "",
    language:
      telegramUser?.language_code === "uz"
        ? "uz"
        : telegramUser?.language_code === "ru"
          ? "ru"
          : "en",
    notifications: true,
  });

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // === UTILITY FUNCTIONS ===
  const updateFormData = useCallback(
    (field: keyof OnboardingData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors],
  );

  const validateCurrentStep = useCallback(() => {
    const step = currentStep;
    if (!step.validation) return true;

    try {
      step.validation.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (currentStep.validation && !validateCurrentStep()) {
      hapticFeedback.notification("error");
      return;
    }

    hapticFeedback.impact("light");

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, currentStep, validateCurrentStep, hapticFeedback]);

  const prevStep = useCallback(() => {
    hapticFeedback.impact("light");
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex, hapticFeedback]);

  const submitOnboarding = useCallback(async () => {
    setLoading(true);
    hapticFeedback.impact("heavy");

    try {
      // Calculate BMR and daily calories
      const age = new Date().getFullYear() - parseInt(formData.birthYear);
      const heightNum = parseFloat(formData.height);
      const weightNum = parseFloat(formData.weight);

      let bmr = 0;
      if (formData.gender === "male") {
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
            formData.activityLevel as keyof typeof activityMultiplier
          ],
      );

      // Create user profile
      const userProfile = {
        telegramId: telegramUser?.id?.toString() || "demo_user_123",
        name: formData.name,
        gender: formData.gender,
        birthYear: formData.birthYear,
        age,
        height: formData.height,
        weight: formData.weight,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        sleepTime: formData.sleepTime || "22:00",
        wakeTime: formData.wakeTime || "07:00",
        language: formData.language,
        bmr: Math.round(bmr),
        dailyCalories,
        isFirstTime: false,
        createdAt: new Date().toISOString(),
      };

      // Update user context
      updateUser(userProfile);

      // Celebrate completion
      hapticFeedback.notification("success");

      // Navigate to main app
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Onboarding error:", error);
      hapticFeedback.notification("error");
    } finally {
      setLoading(false);
    }
  }, [formData, telegramUser, updateUser, navigate, hapticFeedback]);

  // === STEP COMPONENTS ===
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6 animate-fade-in-up">
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-premium rounded-full flex items-center justify-center mb-6 animate-float">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 animate-bounce-subtle">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-mint-600 to-water-600 bg-clip-text text-transparent">
          Salom, {telegramUser?.first_name || "Foydalanuvchi"}! 👋
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Caloria AI bilan sog'liq sayohatingizni boshlang. Bir necha daqiqada
          shaxsiy profilingizni sozlab olamiz.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-success-50 rounded-xl text-center">
          <Heart className="w-8 h-8 text-success-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-success-800">
            Sog'liq Kuzatuvi
          </p>
        </div>
        <div className="p-4 bg-water-50 rounded-xl text-center">
          <Zap className="w-8 h-8 text-water-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-water-800">AI Yordamchi</p>
        </div>
        <div className="p-4 bg-activity-50 rounded-xl text-center">
          <Target className="w-8 h-8 text-activity-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-activity-800">Maqsadlar</p>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Ismingiz
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            placeholder="Ismingizni kiriting"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Jinsiyat</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => updateFormData("gender", value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Erkak</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Ayol</Label>
            </div>
          </RadioGroup>
          {errors.gender && (
            <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <Label htmlFor="birthYear" className="text-sm font-medium">
            Tug'ilgan yil
          </Label>
          <Select
            value={formData.birthYear}
            onValueChange={(value) => updateFormData("birthYear", value)}
          >
            <SelectTrigger className={errors.birthYear ? "border-red-500" : ""}>
              <SelectValue placeholder="Yilni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 80 }, (_, i) => {
                const year = new Date().getFullYear() - 13 - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.birthYear && (
            <p className="text-sm text-red-500 mt-1">{errors.birthYear}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderBodyMetricsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height" className="text-sm font-medium">
            Bo'y (sm)
          </Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData("height", e.target.value)}
            placeholder="175"
            className={errors.height ? "border-red-500" : ""}
          />
          {errors.height && (
            <p className="text-sm text-red-500 mt-1">{errors.height}</p>
          )}
        </div>

        <div>
          <Label htmlFor="weight" className="text-sm font-medium">
            Vazn (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData("weight", e.target.value)}
            placeholder="70"
            className={errors.weight ? "border-red-500" : ""}
          />
          {errors.weight && (
            <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Faollik darajasi</Label>
        <RadioGroup
          value={formData.activityLevel}
          onValueChange={(value) => updateFormData("activityLevel", value)}
          className="mt-3 space-y-3"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="low" id="low" />
            <div className="flex-1">
              <Label htmlFor="low" className="font-medium">
                Kam faol
              </Label>
              <p className="text-sm text-muted-foreground">
                Asosan o'tirib ishlash, kam sport
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="medium" id="medium" />
            <div className="flex-1">
              <Label htmlFor="medium" className="font-medium">
                O'rtacha faol
              </Label>
              <p className="text-sm text-muted-foreground">
                Haftada 3-5 marta sport
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="high" id="high" />
            <div className="flex-1">
              <Label htmlFor="high" className="font-medium">
                Juda faol
              </Label>
              <p className="text-sm text-muted-foreground">
                Har kuni sport, og'ir jismoniy ish
              </p>
            </div>
          </div>
        </RadioGroup>
        {errors.activityLevel && (
          <p className="text-sm text-red-500 mt-1">{errors.activityLevel}</p>
        )}
      </div>
    </div>
  );

  const renderHealthGoalsStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">Asosiy maqsad</Label>
        <RadioGroup
          value={formData.goal}
          onValueChange={(value) => updateFormData("goal", value)}
          className="mt-3 space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="lose" id="lose" />
            <div className="flex-1">
              <Label htmlFor="lose" className="font-medium">
                Vazn kamaytirishz
              </Label>
              <p className="text-sm text-muted-foreground">
                Sog'lom usulda vazn yo'qotish
              </p>
            </div>
            <span className="text-2xl">🔥</span>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="maintain" id="maintain" />
            <div className="flex-1">
              <Label htmlFor="maintain" className="font-medium">
                Vaznni saqlash
              </Label>
              <p className="text-sm text-muted-foreground">
                Joriy vaznni barqaror ushlab turish
              </p>
            </div>
            <span className="text-2xl">⚖️</span>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50">
            <RadioGroupItem value="gain" id="gain" />
            <div className="flex-1">
              <Label htmlFor="gain" className="font-medium">
                Vazn ko'tarish
              </Label>
              <p className="text-sm text-muted-foreground">
                Sog'lom usulda vazn olish
              </p>
            </div>
            <span className="text-2xl">💪</span>
          </div>
        </RadioGroup>
        {errors.goal && (
          <p className="text-sm text-red-500 mt-1">{errors.goal}</p>
        )}
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="text-center space-y-6 animate-zoom-in">
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mb-6 animate-heart-beat">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-success-500 opacity-30 animate-ping"></div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-success-600">
          Tabriklaymiz! 🎉
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Profilingiz muvaffaqiyatli sozlandi. Endi Caloria AI bilan sog'liq
          sayohatingizni boshlashingiz mumkin!
        </p>
      </div>

      <div className="bg-gradient-success p-6 rounded-2xl text-center">
        <h3 className="font-semibold text-success-800 mb-2">
          Sizning kunlik maqsadingiz:
        </h3>
        <div className="text-3xl font-bold text-success-900">
          {useMemo(() => {
            const age =
              new Date().getFullYear() - parseInt(formData.birthYear || "2000");
            const heightNum = parseFloat(formData.height || "170");
            const weightNum = parseFloat(formData.weight || "70");

            let bmr = 0;
            if (formData.gender === "male") {
              bmr =
                88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * age;
            } else {
              bmr =
                447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * age;
            }

            const activityMultiplier = { low: 1.2, medium: 1.55, high: 1.725 };
            const dailyCalories = Math.round(
              bmr *
                activityMultiplier[
                  formData.activityLevel as keyof typeof activityMultiplier
                ],
            );

            return dailyCalories;
          }, [formData])}{" "}
          kaloriya
        </div>
      </div>
    </div>
  );

  // === RENDER CURRENT STEP CONTENT ===
  const renderStepContent = () => {
    switch (currentStep.id) {
      case "welcome":
        return renderWelcomeStep();
      case "personal-info":
        return renderPersonalInfoStep();
      case "body-metrics":
        return renderBodyMetricsStep();
      case "health-goals":
        return renderHealthGoalsStep();
      case "preferences":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleepTime">Uyqu vaqti</Label>
                <Input
                  id="sleepTime"
                  type="time"
                  value={formData.sleepTime}
                  onChange={(e) => updateFormData("sleepTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="wakeTime">Turish vaqti</Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => updateFormData("wakeTime", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Til</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => updateFormData("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">O'zbek</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "completion":
        return renderCompletionStep();
      default:
        return null;
    }
  };

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-medium text-muted-foreground">
              Qadam {currentStepIndex + 1} / {ONBOARDING_STEPS.length}
            </h1>
            {currentStep.isOptional && (
              <Badge variant="secondary" className="text-xs">
                Ixtiyoriy
              </Badge>
            )}
          </div>

          <div className="relative">
            <Progress value={currentStep.progress} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-mint-500 to-water-500 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              style={{ width: `${currentStep.progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {currentStep.progress}% tayyor
          </p>
        </div>

        {/* Step Content */}
        <Card className="glass-medium border-0 card-shadow-premium overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-premium rounded-full">
                <currentStep.icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {currentStep.title}
            </CardTitle>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 px-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>

          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStepIndex
                    ? "bg-mint-500 scale-125"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button
              onClick={submitOnboarding}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-mint-500 to-water-500 hover:from-mint-600 hover:to-water-600"
            >
              {loading ? "Yuklanmoqda..." : "Tugatish"}
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Keyingisi
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
