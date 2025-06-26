import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { supabase } from '@/lib/supabase';

const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const isValidEmail = (input: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

const isValidPhone = (input: string) => {
  const cleaned = input.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export default function LoginScreen() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleInputChange = (text: string) => {
    setUserInput(text);
    setError(null);
    setMagicLinkSent(false);
  };

  const handleLogin = async () => {
    if (!userInput) {
      setError('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if input is email or phone
      const isEmail = isValidEmail(userInput);
      const isPhone = isValidPhone(userInput);

      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email or phone number');
      }

      if (isEmail) {
        // Handle email magic link login
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: userInput,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: 'https://pfrlxclmdiccaopmpnhy.supabase.co/auth/v1/callback'
          }
        });

        if (signInError) throw signInError;
        setMagicLinkSent(true);
      } else {
        // Handle phone OTP login
        const formattedPhone = formatPhoneNumber(userInput);
        const { error: signInError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (signInError) {
          if (signInError.message?.includes('unsupported provider')) {
            throw new Error('Phone authentication is not configured. Please use email login.');
          }
          throw signInError;
        }

        setIsVerifying(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Error initiating login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(userInput);

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms'
      });

      if (verifyError) {
        if (verifyError.message?.includes('Token has expired')) {
          throw new Error('Verification code has expired. Please request a new one.');
        } else if (verifyError.message?.includes('Invalid token')) {
          throw new Error('Invalid verification code. Please try again.');
        }
        throw verifyError;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      setIsVerifying(false);
      setUserInput('');
      setVerificationCode('');

    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err instanceof Error ? err.message : 'Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'openid email profile',
            hd: '*'
          },
          redirectTo: 'https://pfrlxclmdiccaopmpnhy.supabase.co/auth/v1/callback'
        }
      });

      if (error) {
        if (error.message?.includes('org_internal')) {
          throw new Error('Please make sure you have selected the correct Google account and try again.');
        }
        throw error;
      }

      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
      }

    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err instanceof Error ? err.message : 'Error signing in with Google');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable 
            onPress={() => setIsVerifying(false)}
            style={styles.backButtonContainer}
          >
            <ArrowLeft size={20} color={Colors.primary[500]} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[Typography.h1, styles.title]}>Verify Your Phone</Text>
              <Text style={[Typography.body, styles.subtitle]}>
                Enter the 6-digit code we sent to {userInput}
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[Typography.label, styles.label]}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  value={verificationCode}
                  onChangeText={(text) => {
                    setVerificationCode(text);
                    setError(null);
                  }}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <CustomButton
                title="Verify Code"
                onPress={handleVerifyOTP}
                loading={loading}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable 
          onPress={() => router.back()}
          style={styles.backButtonContainer}
        >
          <ArrowLeft size={20} color={Colors.primary[500]} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[Typography.h1, styles.title]}>Welcome Back</Text>
            <Text style={[Typography.body, styles.subtitle]}>
              Sign in to continue sourcing premium leather goods
            </Text>
          </View>
          
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              loading={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[Typography.label, styles.label]}>Email or Phone Number</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={userInput}
                onChangeText={handleInputChange}
                placeholder="Enter your email or phone number"
                autoCapitalize="none"
                keyboardType={isValidEmail(userInput) ? 'email-address' : 'phone-pad'}
                editable={!loading}
              />
            </View>
            
            {magicLinkSent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Magic link has been sent to your email. Please check your inbox and click the link to sign in.
                </Text>
              </View>
            ) : (
              <CustomButton
                title="Continue"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || !userInput}
              />
            )}

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/auth/signup" asChild>
                <Pressable>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  backButtonText: {
    marginLeft: 8,
    color: Colors.primary[500],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.neutral[600],
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: Colors.neutral[700],
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  button: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: Colors.status.errorLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: Colors.neutral[600],
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary[600],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginHorizontal: 10,
  },
  inputContainer: {
    gap: 8,
  },
  successContainer: {
    backgroundColor: Colors.neutral[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.success,
  },
  successText: {
    color: Colors.status.success,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});