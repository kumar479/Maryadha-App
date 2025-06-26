import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import LoadingSpinner from '../shared/LoadingSpinner';
import GoogleIcon from '../shared/GoogleIcon';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export default function GoogleSignInButton({ onPress, loading = false }: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <LoadingSpinner color={Colors.neutral[700]} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <GoogleIcon size={20} />
          </View>
          <Text style={[Typography.bodyLarge, styles.text]}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    color: Colors.neutral[900],
  },
}); 