import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import { supabase } from '@/lib/supabase';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import ValidationErrors from '@/components/shared/ValidationErrors';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  checkExistingUser,
  isEmail,
  isPhoneNumber,
  formatPhoneNumber,
  isMaryadhaEmail,
  isPersonalEmail,
  ExistingUserResult
} from '@/utils/user';

// Custom error component with login link
type ErrorMessageProps = {
  message: string;
  showLoginLink?: boolean;
  onLoginPress?: () => void;
};

const ErrorMessage = ({ message, showLoginLink, onLoginPress }: ErrorMessageProps) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {showLoginLink && (
      <Pressable onPress={onLoginPress}>
        <Text style={styles.errorLink}>Sign in to your account</Text>
      </Pressable>
    )}
  </View>
);

// User record creation helper
const createUserRecords = async (userId: string, identifier: string | null, provider: string) => {
  if (!identifier) {
    throw new Error('Identifier (email or phone) is required');
  }

  const isEmailIdentifier = isEmail(identifier);
  const role = isEmailIdentifier && isMaryadhaEmail(identifier) ? 'rep' : 'brand';

  // Update the auth user's app_metadata role so it is available in the session
  const { error: roleError } = await supabase.rpc('set_user_role', {
    p_user_id: userId,
    p_role: role,
  });
  if (roleError) throw roleError;

  // Store user info in public.users table first
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: isEmailIdentifier ? identifier : null,
      raw_app_meta_data: {
        role,
        provider
      }
    }, {
      onConflict: 'id'
    });

  if (userError) throw userError;

  if (isEmailIdentifier && isMaryadhaEmail(identifier)) {
    // Store in reps table for @maryadha.com emails
    const { error: repError } = await supabase
      .from('reps')
      .upsert({
        user_id: userId,
        email: identifier,
        name: identifier.split('@')[0], // Default name from email
        active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });
    
    if (repError) throw repError;
  } else {
    // Store in brands table for all other cases (non-maryadha emails and phone numbers)
    const { error: brandError } = await supabase
      .from('brands')
      .upsert({
        id: userId,
        email: isEmailIdentifier ? identifier : null,
        name: isEmailIdentifier ? identifier.split('@')[0] : `Brand_${userId.slice(0, 8)}`,
        website: '',
        logo_url: ''
      }, {
        onConflict: 'id'
      });
    
    if (brandError) throw brandError;
  }
};

export default function SignUpScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; showLoginLink?: boolean } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { validationResult, validatePasswordInput, clearValidation } = usePasswordValidation();

  const handleLoginPress = () => {
    router.push('/auth/login');
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
            scope: 'openid email profile'
          },
          redirectTo: `${window.location.origin}/auth/emailConfirm/confirm`
        }
      });

      if (error) throw error;

      // For mobile platforms, handle the redirect manually
      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
      }

    } catch (err) {
      console.error('Google sign in error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Error signing in with Google',
        showLoginLink: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePasswordInput(text);
  };

  const handleSignUp = async () => {
    if (!identifier) {
      setError({ message: 'Please enter your email or phone number' });
      return;
    }

    const validation = validatePasswordInput(password);
    if (!validation.isValid) {
      return;
    }

    // Add check for personal email domains
    if (isEmail(identifier) && isPersonalEmail(identifier)) {
      setError({ message: 'Please use your business email address. Personal email domains are not allowed.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user already exists with detailed info
      const existingUser = await checkExistingUser(identifier);
      if (existingUser.exists) {
        const accountType = existingUser.type === 'rep' ? 'Maryadha representative' : 'brand';
        const identifierType = isEmail(identifier) ? 'email address' : 'phone number';
        setError({
          message: `An account already exists for this ${identifierType}. The account is registered as a ${accountType}.`,
          showLoginLink: true
        });
        return;
      }

      if (isEmail(identifier)) {
        // Email signup flow
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            data: {
              role: isMaryadhaEmail(identifier) ? 'rep' : 'brand'
            },
            emailRedirectTo: `${window.location.origin}/auth/emailConfirm/confirm`
          }
        });

        if (signUpError) {
          // Enhance Supabase auth error messages
          if (signUpError.message.includes('already registered')) {
            setError({
              message: 'This email is already registered in our authentication system.',
              showLoginLink: true
            });
            return;
          }
          throw signUpError;
        }

        if (!authData.user) throw new Error('No user data returned');

        await createUserRecords(authData.user.id, identifier, 'email');
        
        // Show success message
        setIsSuccess(true);

      } else if (isPhoneNumber(identifier)) {
        // Phone signup flow
        const formattedPhone = formatPhoneNumber(identifier);
        
        const { error: signUpError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (signUpError) {
          // Enhance phone auth error messages
          if (signUpError.message.includes('already exists')) {
            setError({
              message: 'This phone number is already registered.',
              showLoginLink: true
            });
            return;
          }
          throw signUpError;
        }

        setIsVerifying(true);

      } else {
        setError({ message: 'Please enter a valid email address or phone number' });
      }

    } catch (err) {
      console.error('Signup error:', err);
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        showLoginLink: err instanceof Error && err.message.includes('registered')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationCode) {
      setError({ message: 'Please enter the verification code' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(identifier);
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms'
      });

      if (verifyError) throw verifyError;
      if (!data.user) throw new Error('No user data returned');

      await createUserRecords(data.user.id, identifier, 'phone');
      
      // Redirect to login after phone verification
      router.push({
        pathname: '/auth/login',
        params: { verified: 'true' }
      });

    } catch (err) {
      console.error('OTP verification error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Error verifying code',
        showLoginLink: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[Typography.h1, styles.title]}>Thank You for Signing Up!</Text>
              <Text style={[Typography.body, styles.description]}>
                A confirmation email has been sent to your inbox. Please verify your email address by clicking the link provided.
              </Text>
              <Text style={[Typography.body, styles.description, { marginTop: 16 }]}>
                Please check your spam folder if you don't see the email in your inbox.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[Typography.h1, styles.title]}>Verify Your Phone</Text>
              <Text style={styles.description}>
                Enter the 6-digit code we sent to {identifier}
              </Text>
            </View>

            {error && (
              <ErrorMessage
                message={error.message}
                showLoginLink={error.showLoginLink}
                onLoginPress={handleLoginPress}
              />
            )}

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <TextInput
                  style={styles.input}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
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
        <View style={styles.header}>
          <Text style={[Typography.h1, styles.title]}>Create Account</Text>
          <Text style={[Typography.body, styles.subtitle]}>
            A curated bridge between global luxury brands and India's finest leather manufacturers — with rep oversight, digital storytelling, and full brand control
          </Text>
        </View>

        <View style={styles.form}>
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
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter your email or phone number"
              autoCapitalize="none"
              keyboardType={isEmail(identifier) ? 'email-address' : 'phone-pad'}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[Typography.label, styles.label]}>Password</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Create a strong password"
              secureTextEntry
              editable={!loading}
            />
            {validationResult.errors.length > 0 && (
              <ValidationErrors errors={validationResult.errors} />
            )}
          </View>

          {error && (
            <ErrorMessage
              message={error.message}
              showLoginLink={error.showLoginLink}
              onLoginPress={handleLoginPress}
            />
          )}

          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading || !identifier || !password || !validationResult.isValid}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <Text style={styles.signupLink}>Sign In</Text>
            </Link>
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  description: {
    color: Colors.neutral[600],
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  form: {
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  inputContainer: {
    gap: 8,
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
  googleButton: {
    marginBottom: 0,
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
  errorLink: {
    color: Colors.primary[600],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  label: {
    color: Colors.neutral[700],
  },
});