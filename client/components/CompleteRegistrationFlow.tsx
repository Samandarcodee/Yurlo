import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/use-telegram';
import { useUser } from '../contexts/UserContext';
import { unifiedDataService } from '../services/unified-data-service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

interface UserProfileData {
  telegramId: string;
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
  isFirstTime: boolean;
}

export const CompleteRegistrationFlow: React.FC = () => {
  const { user: telegramUser } = useTelegram();
  const { user: existingUser, updateUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfileData>({
    telegramId: telegramUser?.id?.toString() || 'demo_user_123',
    name: '',
    gender: '',
    birthYear: '',
    age: 0,
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    sleepTime: '',
    wakeTime: '',
    language: 'en',
    bmr: 0,
    dailyCalories: 0,
    isFirstTime: true
  });

  const registrationSteps: RegistrationStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Enter your name and basic details',
      required: true,
      completed: false
    },
    {
      id: 'physical-info',
      title: 'Physical Information',
      description: 'Height, weight, and activity level',
      required: true,
      completed: false
    },
    {
      id: 'goals',
      title: 'Health Goals',
      description: 'Define your fitness and health objectives',
      required: true,
      completed: false
    },
    {
      id: 'sleep-schedule',
      title: 'Sleep Schedule',
      description: 'Set your preferred sleep and wake times',
      required: false,
      completed: false
    },
    {
      id: 'calculations',
      title: 'Calculations',
      description: 'BMR and daily calorie needs',
      required: true,
      completed: false
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Review all information and complete registration',
      required: true,
      completed: false
    }
  ];

  useEffect(() => {
    // Load existing user data if available
    if (existingUser) {
      setProfileData({
        telegramId: existingUser.telegramId || profileData.telegramId,
        name: existingUser.name || '',
        gender: existingUser.gender || '',
        birthYear: existingUser.birthYear || '',
        age: existingUser.age || 0,
        height: existingUser.height || '',
        weight: existingUser.weight || '',
        activityLevel: existingUser.activityLevel || '',
        goal: existingUser.goal || '',
        sleepTime: existingUser.sleepTime || '',
        wakeTime: existingUser.wakeTime || '',
        language: existingUser.language || 'en',
        bmr: existingUser.bmr || 0,
        dailyCalories: existingUser.dailyCalories || 0,
        isFirstTime: existingUser.isFirstTime || false
      });
    }
  }, [existingUser]);

  useEffect(() => {
    // Update step completion status
    updateStepCompletion();
  }, [profileData]);

  const updateStepCompletion = () => {
    registrationSteps.forEach((step, index) => {
      let completed = false;
      
      switch (step.id) {
        case 'basic-info':
          completed = !!(profileData.name && profileData.gender && profileData.birthYear);
          break;
        case 'physical-info':
          completed = !!(profileData.height && profileData.weight && profileData.activityLevel);
          break;
        case 'goals':
          completed = !!profileData.goal;
          break;
        case 'sleep-schedule':
          completed = !!(profileData.sleepTime && profileData.wakeTime);
          break;
        case 'calculations':
          completed = !!(profileData.bmr > 0 && profileData.dailyCalories > 0);
          break;
        case 'review':
          completed = isAllRequiredDataComplete();
          break;
      }
      
      registrationSteps[index].completed = completed;
    });
  };

  const isAllRequiredDataComplete = (): boolean => {
    return !!(
      profileData.name &&
      profileData.gender &&
      profileData.birthYear &&
      profileData.height &&
      profileData.weight &&
      profileData.activityLevel &&
      profileData.goal &&
      profileData.bmr > 0 &&
      profileData.dailyCalories > 0
    );
  };

  const calculateBMR = () => {
    if (!profileData.height || !profileData.weight || !profileData.birthYear) return;

    const height = parseFloat(profileData.height);
    const weight = parseFloat(profileData.weight);
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(profileData.birthYear);

    let bmr = 0;
    if (profileData.gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Calculate daily calories based on activity level
    let activityMultiplier = 1.2; // sedentary
    switch (profileData.activityLevel) {
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
    }

    const dailyCalories = Math.round(bmr * activityMultiplier);

    setProfileData(prev => ({
      ...prev,
      age,
      bmr: Math.round(bmr),
      dailyCalories
    }));
  };

  const handleInputChange = (field: keyof UserProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < registrationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Save to database via API
      const result = await unifiedDataService.createUserProfile(profileData);
      
      if (result) {
        // Update local user context
        updateUser({
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        setSuccess('Registration completed successfully! Your profile has been saved.');
        
        // Mark all steps as completed
        registrationSteps.forEach((step, index) => {
          registrationSteps[index].completed = true;
        });
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="birthYear">Birth Year *</Label>
              <Input
                id="birthYear"
                type="number"
                value={profileData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                placeholder="e.g., 1990"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        );

      case 1: // Physical Information
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="e.g., 175"
                min="100"
                max="250"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                value={profileData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="e.g., 70"
                min="30"
                max="300"
              />
            </div>
            
            <div>
              <Label htmlFor="activityLevel">Activity Level *</Label>
              <Select value={profileData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2: // Goals
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal">Primary Goal *</Label>
              <Select value={profileData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Gain Weight/Muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={profileData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uz">O'zbekcha</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3: // Sleep Schedule
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sleepTime">Preferred Bedtime</Label>
              <Input
                id="sleepTime"
                type="time"
                value={profileData.sleepTime}
                onChange={(e) => handleInputChange('sleepTime', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="wakeTime">Preferred Wake Time</Label>
              <Input
                id="wakeTime"
                type="time"
                value={profileData.wakeTime}
                onChange={(e) => handleInputChange('wakeTime', e.target.value)}
              />
            </div>
          </div>
        );

      case 4: // Calculations
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Button onClick={calculateBMR} disabled={!profileData.height || !profileData.weight || !profileData.birthYear}>
                Calculate BMR & Daily Calories
              </Button>
            </div>
            
            {profileData.bmr > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Basal Metabolic Rate (BMR):</span>
                  <span className="font-bold">{profileData.bmr} kcal/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Calorie Needs:</span>
                  <span className="font-bold">{profileData.dailyCalories} kcal/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span className="font-bold">{profileData.age} years</span>
                </div>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              * BMR is calculated using the Mifflin-St Jeor Equation based on your physical information.
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Review Your Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {profileData.name}</div>
                <div><strong>Gender:</strong> {profileData.gender}</div>
                <div><strong>Age:</strong> {profileData.age} years</div>
                <div><strong>Height:</strong> {profileData.height} cm</div>
                <div><strong>Weight:</strong> {profileData.weight} kg</div>
                <div><strong>Activity Level:</strong> {profileData.activityLevel}</div>
                <div><strong>Goal:</strong> {profileData.goal}</div>
                <div><strong>Daily Calories:</strong> {profileData.dailyCalories} kcal</div>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleCompleteRegistration} 
              disabled={!isAllRequiredDataComplete() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = registrationSteps.filter(step => step.completed).length;
    return (completedSteps / registrationSteps.length) * 100;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {registrationSteps.length}: {registrationSteps[currentStep].title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} />
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < registrationSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!registrationSteps[currentStep].completed}
              >
                Next
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {registrationSteps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
              index === currentStep
                ? 'border-primary bg-primary/10'
                : step.completed
                ? 'border-green-500 bg-green-50'
                : 'border-muted bg-muted/50'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            <div className="text-xs font-medium">{step.title}</div>
            <div className="text-xs text-muted-foreground">{step.description}</div>
            {step.completed && (
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
