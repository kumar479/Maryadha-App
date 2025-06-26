import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import { View, Platform } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthLayout() {
  const { session, initialized } = useAuth();

  // Handle email confirmation and access token in URL for web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      const hash = window.location.hash;
      if (hash) {
        // Get the access token from the URL hash
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Only handle the session if it's not an email confirmation
        if (accessToken && !window.location.pathname.includes('emailConfirm')) {
          // Set the session with the tokens
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          }).then(({ data: { session } }) => {
            if (session?.user) {
              const userRole = session.user.app_metadata?.role;
              if (userRole === 'rep') {
                window.location.replace('/rep/tabs/home');
              } else {
                window.location.replace('/brand/tabs/factories');
              }
            }
          });
        }
      }
    }
  }, []);

  // Show nothing while checking auth state
  if (!initialized) {
    return <View />;
  }

  // Handle authenticated users - skip redirect for email confirmation pages
  if (session?.user && !window.location.pathname.includes('emailConfirm')) {
    const userRole = session.user.app_metadata?.role;
    
    if (userRole === 'rep') {
      return <Redirect href="/rep/tabs/home" />;
    }
    
    if (userRole === 'brand') {
      return <Redirect href="/brand/tabs/factories" />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF9F7' }
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="emailConfirm" />
    </Stack>
  );
}