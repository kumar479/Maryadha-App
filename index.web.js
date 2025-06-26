// Set up environment variable for Expo Router
process.env.EXPO_ROUTER_APP_ROOT = require('path').resolve(__dirname, 'app');

// Import the main entry point
require('expo-router/entry'); 