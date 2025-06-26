import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Platform } from 'react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/6822893/pexels-photo-6822893.jpeg' }}
            style={styles.image}
            resizeMode="cover"
            testID="hero-image"
          />
          <View style={styles.overlay} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[Typography.h1, styles.title]}>
            Welcome to Maryadha
          </Text>
          <Text style={[Typography.body, styles.subtitle]}>
            Connect with premium leather manufacturers and bring your designs to life
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Link href="/auth/signup" asChild>
            <CustomButton
              title="Create Account"
              style={styles.button}
            />
          </Link>
          
          <Link href="/auth/login" asChild>
            <CustomButton
              title="Sign In"
              variant="outline"
              style={styles.button}
            />
          </Link>
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
  },
  imageContainer: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  textContainer: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    color: Colors.neutral[900],
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.neutral[600],
    maxWidth: '90%',
  },
  buttonContainer: {
    padding: 24,
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});