import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';

interface OrderRequestFormProps {
  factoryId: string;
  onSubmit: (formData: any) => void;
  onClose: () => void;
}

export default function OrderRequestForm({ factoryId, onSubmit, onClose }: OrderRequestFormProps) {
  const [quantity, setQuantity] = useState<string>('100');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      setLoading(true);
      setError(null);

      const formData = {
        quantity: Number(quantity),
        notes: notes.trim(),
      };

      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formGroup}>
        <Text style={[Typography.label, styles.label]}>Order Quantity*</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Total Units"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[Typography.label, styles.label]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={Platform.OS === 'ios' ? 0 : 4}
          placeholder="Add any details or special requirements..."
        />
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cancel"
          variant="outline"
          onPress={onClose}
          style={styles.cancelButton}
        />
        <CustomButton
          title="Submit Request"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  errorText: {
    color: Colors.status.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 24,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
