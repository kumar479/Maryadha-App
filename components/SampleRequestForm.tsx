import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

interface SampleRequestFormProps {
  factoryId?: string;
  onSubmit: (formData: {
    techPack: string;
    sketch?: string;
    preferredMoq: number;
    notes: string;
  }) => Promise<void>;
  onClose: () => void;
}

export default function SampleRequestForm({ 
  factoryId,
  onSubmit,
  onClose,
}: SampleRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [designFile, setDesignFile] = useState<string | null>(null);
  const [preferredMoq, setPreferredMoq] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUploadDesign = async () => {
    try {
      setError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload to Supabase Storage
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert uri to blob
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('designs')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('designs')
          .getPublicUrl(filePath);

        setDesignFile(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading design:', error);
      setError('Failed to upload design file. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);
      
      if (!factoryId) {
        throw new Error('Factory ID is required');
      }

      const moq = parseInt(preferredMoq);
      if (isNaN(moq) || moq <= 0) {
        throw new Error('Please enter a valid MOQ');
      }

      setLoading(true);

      await onSubmit({
        techPack: '',
        sketch: designFile || '',
        preferredMoq: moq,
        notes: additionalNotes,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close after 2 seconds to show success message
    } catch (error) {
      console.error('Error submitting sample request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit sample request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text h4 style={styles.title}>Request Sample</Text>
        
        {error && (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.messageContainer}>
            <Text style={styles.successText}>Sample request submitted successfully!</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Design Sketch (Optional)</Text>
          <Button
            title={designFile ? "Change Design" : "Upload Design"}
            onPress={handleUploadDesign}
            type="outline"
            containerStyle={styles.uploadButton}
          />
          {designFile && (
            <Text style={styles.fileName}>Design file uploaded successfully</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Preferred MOQ*</Text>
          <TextInput
            style={styles.input}
            value={preferredMoq}
            onChangeText={setPreferredMoq}
            keyboardType="numeric"
            placeholder="Enter preferred minimum order quantity"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Any specific requirements or details"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            containerStyle={styles.button}
          />
          <Button
            title={loading ? "Submitting..." : "Submit Request"}
            onPress={handleSubmit}
            disabled={loading || !preferredMoq || success}
            containerStyle={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: Colors.neutral[900],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  uploadButton: {
    marginBottom: 10,
  },
  fileName: {
    color: Colors.status.success,
    marginTop: 5,
  },
  messageContainer: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
  },
  successText: {
    color: Colors.status.success,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 