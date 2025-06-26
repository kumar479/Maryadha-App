// Web-specific Stripe implementation
export const getStripeHooks = () => {
  return {
    initPaymentSheet: async () => ({ error: new Error('Payments are only available on mobile devices') }),
    presentPaymentSheet: async () => ({ error: new Error('Payments are only available on mobile devices') }),
  };
};

export const getStripeProvider = () => {
  return ({ children, publishableKey }: { children: React.ReactNode; publishableKey?: string }) => {
    return children;
  };
}; 