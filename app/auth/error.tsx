import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';

export default function AuthErrorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[Typography.h1, styles.title]}>Sign Up Failed</Text>
          <Text style={[Typography.body, styles.subtitle]}>
            There was an error during the sign up process. This might be because:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={[Typography.body, styles.bulletPoint]}>• The email is already registered</Text>
            <Text style={[Typography.body, styles.bulletPoint]}>• You're using a personal email address</Text>
            <Text style={[Typography.body, styles.bulletPoint]}>• There was a network error</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Try Again"
            variant="outline"
            icon={<ArrowLeft size={20} color={Colors.primary[500]} />}
            onPress={() => router.replace('/auth/signup')}
            style={styles.button}
          />
          
          <CustomButton
            title="Contact Support"
            onPress={() => router.push('/support')}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
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
    marginBottom: 16,
  },
  bulletPoints: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  bulletPoint: {
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
});
