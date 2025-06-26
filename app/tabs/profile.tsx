import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleUser as UserCircle, Save, LogOut } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    brandName: '',
    email: '',
    website: '',
    isPublic: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/welcome');
        return;
      }

      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', user.id)
        .single();

      if (brandError && brandError.code !== 'PGRST116') throw brandError;

      setProfile({
        brandName: brand?.name || '',
        email: brand?.email || user.email || '',
        website: brand?.website || '',
        isPublic: brand?.is_public || false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (field: string, value: string | boolean) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };
  
  const handleSave = async () => {
    if (!profile.brandName || !profile.email) {
      setError('Brand name and email are required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('brands')
        .upsert({
          id: user.id,
          name: profile.brandName,
          email: profile.email,
          website: profile.website || null,
          is_public: profile.isPublic,
        });

      if (updateError) throw updateError;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.replace('/(auth)/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error logging out');
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Your Profile</Text>
        <CustomButton
          title="Logout"
          variant="outline"
          size="small"
          icon={<LogOut size={18} color={Colors.primary[500]} />}
          onPress={handleLogout}
          loading={isLoggingOut}
        />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <UserCircle size={60} color={Colors.neutral[400]} />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[Typography.label, styles.label]}>Brand Name*</Text>
          <TextInput
            style={styles.input}
            value={profile.brandName}
            onChangeText={(value) => handleChange('brandName', value)}
            placeholder="Your brand name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[Typography.label, styles.label]}>Email*</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="contact@yourbrand.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[Typography.label, styles.label]}>Website</Text>
          <TextInput
            style={styles.input}
            value={profile.website}
            onChangeText={(value) => handleChange('website', value)}
            placeholder="www.yourbrand.com"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={[Typography.body, styles.switchLabel]}>Show brand publicly</Text>
          <Switch
            value={profile.isPublic}
            onValueChange={(value) => handleChange('isPublic', value)}
            trackColor={{ false: Colors.neutral[300], true: Colors.primary[300] }}
            thumbColor={profile.isPublic ? Colors.primary[500] : Colors.neutral[50]}
          />
        </View>
        
        <CustomButton
          title="Save Profile"
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
      
      {showSuccess && (
        <View style={styles.successContainer}>
          <View style={styles.successMessage}>
            <Save size={20} color="white" style={styles.successIcon} />
            <Text style={styles.successText}>Profile updated successfully</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  switchLabel: {
    color: Colors.neutral[800],
  },
  saveButton: {
    marginBottom: 40,
  },
  successContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.success + 'F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  successIcon: {
    marginRight: 8,
  },
  successText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: Colors.status.errorLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.error,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.status.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});