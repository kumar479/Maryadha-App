// Simple test to check if the web setup works
console.log('Testing web setup...');

// Set environment variable
process.env.EXPO_ROUTER_APP_ROOT = require('path').resolve(__dirname, 'app');
process.env.EXPO_PUBLIC_PLATFORM = 'web';

// Test Stripe module
try {
  const { getStripeHooks, getStripeProvider } = require('./lib/stripe');
  console.log('✅ Stripe module loaded successfully');
  console.log('getStripeHooks:', typeof getStripeHooks);
  console.log('getStripeProvider:', typeof getStripeProvider);
} catch (error) {
  console.error('❌ Error loading Stripe module:', error.message);
}

console.log('Test completed'); 