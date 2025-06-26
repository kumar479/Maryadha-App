import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1470&q=80' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={[Typography.h1, styles.title]}>Elevate Your Craft</Text>
        <Text style={[Typography.body, styles.subtitle]}>Premium leather sourcing at your fingertips</Text>
        <Link href="/brand/tabs/factories" asChild>
          <CustomButton title="Explore Factories" style={styles.button} />
        </Link>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: Colors.neutral[50],
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[50],
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: 200,
  },
});