import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleUser } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import { supabase } from '@/lib/supabase';

export default function OnboardingScreen() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!brandName) {
      setError('Please enter your brand name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('brands')
        .upsert({
          id: user.id,
          name: brandName,
          website: website || null,
        });

      if (updateError) throw updateError;

      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <CircleUser size={60} color={Colors.neutral[400]} />
            </View>
            <Text style={[Typography.h1, styles.title]}>Complete Your Profile</Text>
            <Text style={[Typography.body, styles.subtitle]}>
              Tell us about your brand to get started
            </Text>
          </View>
          
          <View style={styles.form}>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={[Typography.label, styles.label]}>Brand Name*</Text>
              <TextInput
                style={styles.input}
                value={brandName}
                onChangeText={(text) => {
                  setBrandName(text);
                  setError(null);
                }}
                placeholder="Enter your brand name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[Typography.label, styles.label]}>Website (Optional)</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="www.yourbrand.com"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            
            <CustomButton
              title="Complete Setup"
              onPress={handleComplete}
              loading={loading}
              style={styles.button}
            />
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
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
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
  button: {
    marginTop: 8,
  },
  errorText: {
    color: Colors.status.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});