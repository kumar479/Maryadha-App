import React from 'react';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';

// Native-specific Stripe implementation
export const getStripeHooks = () => {
  return useStripe();
};

export const getStripeProvider = () => {
  return StripeProvider;
}; 