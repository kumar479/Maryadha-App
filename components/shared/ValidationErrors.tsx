import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface ValidationErrorsProps {
  errors: string[];
}

export default function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (!errors || errors.length === 0) return null;

  const errorItems = errors.map((error) => `• ${error}`).join('\n');

  return (
    <View style={styles.container}>
      <Text style={[Typography.caption, styles.errorText]}>
        {errorItems}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.status.error,
    lineHeight: 20,
  },
}); 