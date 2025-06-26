/**
 * Environment variables checker
 * 
 * This script checks if all required environment variables are loaded correctly.
 * 
 * Usage:
 * node scripts/check-env.js
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Checking Environment Variables\n');

// Check for .env files
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

console.log('📁 Environment files:');
console.log(`   .env: ${fs.existsSync(envPath) ? '✅ Found' : '❌ Not found'}`);
console.log(`   .env.local: ${fs.existsSync(envLocalPath) ? '✅ Found' : '❌ Not found'}`);

// Load environment variables
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('   ✅ Loaded from .env');
} else if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
  console.log('   ✅ Loaded from .env.local');
} else {
  console.log('   ⚠️  No .env files found, using system environment variables');
}

// Check required variables
console.log('\n🔧 Required Variables:');

const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'RESEND_API_KEY',
  'APP_URL'
];

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');

const optionalVars = [
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'FCM_SERVER_KEY'
];

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`   ⚠️  ${varName}: Not set (optional)`);
  }
});

console.log('\n📊 Summary:');
if (allSet) {
  console.log('   ✅ All required environment variables are set!');
  console.log('   🚀 You can now run the setup and test scripts.');
} else {
  console.log('   ❌ Some required environment variables are missing.');
  console.log('   📝 Please check your .env file and add the missing variables.');
}

console.log('\n💡 Next steps:');
if (allSet) {
  console.log('1. Run: node scripts/setup-rep-assignments.js');
  console.log('2. Run: node scripts/test-email-notification.js');
} else {
  console.log('1. Add missing variables to your .env file');
  console.log('2. Run this script again to verify');
} 