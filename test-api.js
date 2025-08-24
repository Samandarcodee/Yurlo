// Simple API test script
const API_BASE = 'http://localhost:3000/api'; // Change this to your deployed URL

async function testAPI() {
  console.log('🧪 Testing Yurlo AI API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test ping endpoint
    console.log('\n2. Testing ping endpoint...');
    const pingResponse = await fetch(`${API_BASE}/ping`);
    const pingData = await pingResponse.json();
    console.log('✅ Ping response:', pingData);

    // Test user profile endpoints
    console.log('\n3. Testing user profile endpoints...');
    
    // Test GET profile (should fail without telegramId)
    try {
      const profileResponse = await fetch(`${API_BASE}/user/profile`);
      const profileData = await profileResponse.json();
      console.log('✅ Profile GET (no params):', profileData);
    } catch (error) {
      console.log('❌ Profile GET failed as expected:', error.message);
    }

    // Test GET profile with telegramId
    const profileWithIdResponse = await fetch(`${API_BASE}/user/profile?telegramId=test123`);
    const profileWithIdData = await profileWithIdResponse.json();
    console.log('✅ Profile GET (with telegramId):', profileWithIdData);

    // Test POST profile
    const testProfile = {
      telegramId: 'test123',
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

    const createProfileResponse = await fetch(`${API_BASE}/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProfile)
    });
    const createProfileData = await createProfileResponse.json();
    console.log('✅ Profile POST:', createProfileData);

    // Test sleep sessions endpoint
    console.log('\n4. Testing sleep sessions endpoint...');
    const sleepResponse = await fetch(`${API_BASE}/sleep-sessions?userId=test123`);
    const sleepData = await sleepResponse.json();
    console.log('✅ Sleep sessions GET:', sleepData);

    // Test step sessions endpoint
    console.log('\n5. Testing step sessions endpoint...');
    const stepResponse = await fetch(`${API_BASE}/step-sessions?userId=test123`);
    const stepData = await stepResponse.json();
    console.log('✅ Step sessions GET:', stepData);

    // Test meal entries endpoint
    console.log('\n6. Testing meal entries endpoint...');
    const mealResponse = await fetch(`${API_BASE}/meal-entries?userId=test123`);
    const mealData = await mealResponse.json();
    console.log('✅ Meal entries GET:', mealData);

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testAPI();
