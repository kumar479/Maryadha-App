import { Platform } from 'react-native';

// Platform-specific Stripe implementation
let getStripeHooks: any;
let getStripeProvider: any;

if (Platform.OS === 'web') {
  // Import web-specific implementation
  const webModule = require('./stripe.web');
  getStripeHooks = webModule.getStripeHooks;
  getStripeProvider = webModule.getStripeProvider;
} else {
  // Import native-specific implementation
  const nativeModule = require('./stripe.native');
  getStripeHooks = nativeModule.getStripeHooks;
  getStripeProvider = nativeModule.getStripeProvider;
}

export { getStripeHooks, getStripeProvider }; 