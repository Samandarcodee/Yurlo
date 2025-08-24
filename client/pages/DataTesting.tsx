import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/use-telegram';
import { useUser } from '../contexts/UserContext';
import { unifiedDataService } from '../services/unified-data-service';
import { DataValidationService } from '../services/data-validation-service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCircle, AlertCircle, Loader2, Database, Server, Wifi } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  error?: string;
}

export const DataTesting: React.FC = () => {
  const { user: telegramUser } = useTelegram();
  const { user: existingUser } = useUser();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testData, setTestData] = useState({
    name: 'Test User',
    gender: 'male',
    birthYear: '1990',
    height: '175',
    weight: '70',
    activityLevel: 'moderate',
    goal: 'maintain',
    sleepTime: '22:00',
    wakeTime: '07:00'
  });

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      { name: 'API Health Check', fn: testApiHealth },
      { name: 'Database Connection', fn: testDatabaseConnection },
      { name: 'User Profile Creation', fn: testUserProfileCreation },
      { name: 'User Profile Retrieval', fn: testUserProfileRetrieval },
      { name: 'Sleep Session Creation', fn: testSleepSessionCreation },
      { name: 'Step Session Creation', fn: testStepSessionCreation },
      { name: 'Meal Entry Creation', fn: testMealEntryCreation },
      { name: 'Data Validation', fn: testDataValidation },
      { name: 'AI Recommendations', fn: testAIRecommendations },
      { name: 'Data Consistency', fn: testDataConsistency }
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
    }

    setIsRunningTests(false);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    // Add pending status
    setTestResults(prev => [...prev, { test: testName, status: 'pending', message: 'Running...' }]);

    try {
      const result = await testFn();
      setTestResults(prev => 
        prev.map(r => 
          r.test === testName 
            ? { test: testName, status: 'success', message: 'Test passed', data: result }
            : r
        )
      );
    } catch (error) {
      setTestResults(prev => 
        prev.map(r => 
          r.test === testName 
            ? { test: testName, status: 'error', message: 'Test failed', error: error instanceof Error ? error.message : 'Unknown error' }
            : r
        )
      );
    }
  };

  const testApiHealth = async () => {
    const result = await unifiedDataService.healthCheck();
    if (result.status === 'ok') {
      return result;
    }
    throw new Error('API health check failed');
  };

  const testDatabaseConnection = async () => {
    // Test if we can create and retrieve a simple test record
    const testProfile = {
      telegramId: `test_${Date.now()}`,
      name: 'Test Connection User',
      gender: 'male',
      birthYear: '1990',
      age: 33,
      height: '175',
      weight: '70',
      activityLevel: 'moderate',
      goal: 'maintain',
      language: 'en',
      bmr: 1800,
      dailyCalories: 2200,
      isFirstTime: true
    };

    const created = await unifiedDataService.createUserProfile(testProfile);
    if (!created) throw new Error('Failed to create test profile');

    const retrieved = await unifiedDataService.getUserProfile(testProfile.telegramId);
    if (!retrieved) throw new Error('Failed to retrieve test profile');

    // Clean up test data
    try {
      await unifiedDataService.deleteUserProfile(testProfile.telegramId);
    } catch (e) {
      console.warn('Failed to clean up test profile:', e);
    }

    return { created, retrieved };
  };

  const testUserProfileCreation = async () => {
    const testProfile = {
      telegramId: `test_profile_${Date.now()}`,
      name: testData.name,
      gender: testData.gender,
      birthYear: testData.birthYear,
      age: 33,
      height: testData.height,
      weight: testData.weight,
      activityLevel: testData.activityLevel,
      goal: testData.goal,
      sleepTime: testData.sleepTime,
      wakeTime: testData.wakeTime,
      language: 'en',
      bmr: 1800,
      dailyCalories: 2200,
      isFirstTime: true
    };

    const result = await unifiedDataService.createUserProfile(testProfile);
    if (!result) throw new Error('Profile creation failed');

    // Clean up
    try {
      await unifiedDataService.deleteUserProfile(testProfile.telegramId);
    } catch (e) {
      console.warn('Failed to clean up test profile:', e);
    }

    return result;
  };

  const testUserProfileRetrieval = async () => {
    if (!existingUser?.telegramId) {
      throw new Error('No existing user to test retrieval');
    }

    const result = await unifiedDataService.getUserProfile(existingUser.telegramId);
    if (!result) throw new Error('Profile retrieval failed');

    return result;
  };

  const testSleepSessionCreation = async () => {
    if (!existingUser?.telegramId) {
      throw new Error('No existing user to test sleep session creation');
    }

    const sleepSession = {
      userId: existingUser.telegramId,
      date: new Date().toISOString().split('T')[0],
      bedTime: testData.sleepTime,
      wakeTime: testData.wakeTime,
      duration: 8,
      quality: 7,
      notes: 'Test sleep session'
    };

    const result = await unifiedDataService.createSleepSession(sleepSession);
    if (!result) throw new Error('Sleep session creation failed');

    return result;
  };

  const testStepSessionCreation = async () => {
    if (!existingUser?.telegramId) {
      throw new Error('No existing user to test step session creation');
    }

    const stepSession = {
      userId: existingUser.telegramId,
      date: new Date().toISOString().split('T')[0],
      steps: 8000,
      distance: 6.4,
      calories: 400,
      duration: 60
    };

    const result = await unifiedDataService.createStepSession(stepSession);
    if (!result) throw new Error('Step session creation failed');

    return result;
  };

  const testMealEntryCreation = async () => {
    if (!existingUser?.telegramId) {
      throw new Error('No existing user to test meal entry creation');
    }

    const mealEntry = {
      userId: existingUser.telegramId,
      name: 'Test Meal',
      calories: 500,
      protein: 25,
      carbs: 60,
      fat: 20,
      mealType: 'lunch' as const,
      date: new Date().toISOString().split('T')[0]
    };

    const result = await unifiedDataService.createMealEntry(mealEntry);
    if (!result) throw new Error('Meal entry creation failed');

    return result;
  };

  const testDataValidation = async () => {
    const testData = {
      telegramId: 'test_validation',
      name: 'Test User',
      gender: 'male',
      birthYear: '1990',
      age: 33,
      height: '175',
      weight: '70',
      activityLevel: 'moderate',
      goal: 'maintain',
      language: 'en',
      bmr: 1800,
      dailyCalories: 2200,
      isFirstTime: true
    };

    const validation = DataValidationService.comprehensiveValidation(testData, 'profile');
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
    }

    return validation;
  };

  const testAIRecommendations = async () => {
    if (!existingUser?.telegramId) {
      throw new Error('No existing user to test AI recommendations');
    }

    const result = await unifiedDataService.getAIRecommendations(existingUser.telegramId);
    if (!result) throw new Error('AI recommendations failed');

    return result;
  };

  const testDataConsistency = async () => {
    const testData = {
      sleepTime: '22:00',
      wakeTime: '07:00',
      birthYear: '1990',
      age: 33,
      bmr: 1800,
      dailyCalories: 2200
    };

    const consistency = DataValidationService.checkDataConsistency(testData);
    if (!consistency.isValid) {
      throw new Error(`Data consistency check failed: ${consistency.issues.join(', ')}`);
    }

    return consistency;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Real Data Testing & Validation
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all real data functionality, validation, and database operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Server className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-sm font-medium">API Status</div>
                <div className="text-xs text-blue-600">Connected</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Database className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-sm font-medium">Database</div>
                <div className="text-xs text-green-600">Supabase</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Wifi className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-sm font-medium">Real-time</div>
                <div className="text-xs text-purple-600">Ready</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <div className="text-sm font-medium">Validation</div>
                <div className="text-xs text-orange-600">Active</div>
              </div>
            </div>

            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="test-data">Test Data</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from all data functionality tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      {result.message}
                    </div>
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600">
                          View Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No tests run yet. Click "Run All Tests" to start testing.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Data Configuration</CardTitle>
              <CardDescription>
                Configure test data for validation testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-name">Name</Label>
                  <Input
                    id="test-name"
                    value={testData.name}
                    onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-gender">Gender</Label>
                  <Select value={testData.gender} onValueChange={(value) => setTestData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-birth-year">Birth Year</Label>
                  <Input
                    id="test-birth-year"
                    type="number"
                    value={testData.birthYear}
                    onChange={(e) => setTestData(prev => ({ ...prev, birthYear: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-height">Height (cm)</Label>
                  <Input
                    id="test-height"
                    type="number"
                    value={testData.height}
                    onChange={(e) => setTestData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-weight">Weight (kg)</Label>
                  <Input
                    id="test-weight"
                    type="number"
                    value={testData.weight}
                    onChange={(e) => setTestData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-activity">Activity Level</Label>
                  <Select value={testData.activityLevel} onValueChange={(value) => setTestData(prev => ({ ...prev, activityLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="very_active">Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-goal">Goal</Label>
                  <Select value={testData.goal} onValueChange={(value) => setTestData(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-sleep-time">Sleep Time</Label>
                  <Input
                    id="test-sleep-time"
                    type="time"
                    value={testData.sleepTime}
                    onChange={(e) => setTestData(prev => ({ ...prev, sleepTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-wake-time">Wake Time</Label>
                  <Input
                    id="test-wake-time"
                    type="time"
                    value={testData.wakeTime}
                    onChange={(e) => setTestData(prev => ({ ...prev, wakeTime: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-blue-600">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
