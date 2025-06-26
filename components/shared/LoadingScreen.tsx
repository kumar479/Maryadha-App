import React from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1616627457921-cb8294c78c9a?auto=format&fit=crop&w=1350&q=80' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={[Typography.body, styles.message]}>{message}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    color: Colors.neutral[50],
    textAlign: 'center',
  },
});
