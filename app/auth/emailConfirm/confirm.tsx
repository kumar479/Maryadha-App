import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import { checkExistingUser, isEmail } from '@/utils/user';

export default function EmailConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the error parameters from the URL if any
        const error = params?.error;
        const errorDescription = params?.error_description;

        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription?.toString() || 'An error occurred during email confirmation');
          return;
        }

        let userEmail: string | null = null;
        let sessionUser = null;

        if (Platform.OS === 'web') {
          // On web, handle hash parameters
          const hash = window.location.hash;
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken) {
              // Set the session with the tokens
              const { data: { session }, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (sessionError) throw sessionError;

              if (session?.user) {
                sessionUser = session.user;
                userEmail = session.user.email ?? null;
              }
            }
          }
        } else {
          // For native platforms, handle the confirmation differently
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (session?.user) {
            sessionUser = session.user;
            userEmail = session.user.email ?? null;
          }
        }

        if (!sessionUser || !userEmail) {
          throw new Error('No valid session found');
        }

        // Check if user already exists in brands or reps
        const existingUser = await checkExistingUser(userEmail);
        if (existingUser.exists) {
          const accountType = existingUser.type === 'rep' ? 'Maryadha representative' : 'brand';
          setStatus('error');
          setErrorMessage(
            `An account already exists for this email address. The account is registered as a ${accountType}.\nPlease sign in to your account.`
          );
          return;
        }

        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
        console.error('Email confirmation error:', err);
      }
    };

    handleEmailConfirmation();
  }, [params, router, pathname]);

  if (status === 'loading') {
    return <LoadingScreen message="Verifying your email..." />;
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[Typography.h1, styles.title]}>Verification Failed</Text>
          <Text style={[Typography.body, styles.errorText]}>{errorMessage}</Text>
          <CustomButton
            title="Go to Login"
            onPress={() => router.replace('/auth/login')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[Typography.h1, styles.title]}>Email Verified Successfully!</Text>
            <Text style={[Typography.body, styles.subtitle]}>
              Thank you for verifying your email address. Your account is now fully activated.
            </Text>
            <Text style={[Typography.body, styles.subtitle, styles.welcomeText]}>
              Welcome to Maryadha! Please sign in to access your account.
            </Text>
          </View>
          <CustomButton
            title="Sign In"
            onPress={() => router.replace('/auth/login')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.primary[700],
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  welcomeText: {
    marginTop: 8,
    color: Colors.primary[600],
    fontFamily: 'Inter_500Medium',
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
