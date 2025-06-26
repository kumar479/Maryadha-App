const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle platform-specific imports
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure resolver to handle native-only modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add resolver configuration for web platform
config.resolver.alias = {
  ...config.resolver.alias,
  // Ensure native-only modules are not resolved on web
  '@stripe/stripe-react-native': process.env.EXPO_PUBLIC_PLATFORM === 'web' ? false : '@stripe/stripe-react-native',
};

module.exports = config; 