#!/usr/bin/env tsx

import { runComprehensiveDatabaseTest } from './database-test';

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Test telegram ID (demo user)
  const testTelegramId = 'demo_user_123';
  
  console.log('🗄️ Yurlo AI Database Test Runner');
  console.log('=====================================');
  
  switch (command) {
    case 'migration':
      console.log('🔄 Testing data migration...');
      // Migration test logic will be handled in the main test
      break;
      
    case 'schema':
      console.log('📋 Testing database schema...');
      // Schema validation will be part of connection test
      break;
      
    default:
      console.log('🚀 Running comprehensive database test...');
  }
  
  try {
    const results = await runComprehensiveDatabaseTest(testTelegramId);
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Database Connection: ${results.connection ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Profile Ops: ${results.userProfile ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Sleep Sessions: ${results.sleepSessions ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Step Sessions: ${results.stepSessions ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Meal Entries: ${results.mealEntries ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Data Migration: ${results.migration ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('\n🎉 All database tests passed!');
      console.log('✅ Database integration is working correctly');
      process.exit(0);
    } else {
      console.log('\n❌ Some database tests failed');
      console.log('🔧 Please check your Supabase configuration');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Database test runner failed:', error);
    process.exit(1);
  }
};

// Run the test
main().catch(console.error); 