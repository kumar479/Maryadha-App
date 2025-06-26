import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { FileText, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import { supabase } from '@/lib/supabase';

interface SampleRequestFormProps {
  factoryId: string;
  onSubmit: (formData: any) => void;
  onClose: () => void;
}

export default function SampleRequestForm({
  factoryId,
  onSubmit,
  onClose,
}: SampleRequestFormProps) {
  const [productName, setProductName] = useState('');
  const [techPack, setTechPack] =
    useState<DocumentPicker.DocumentResult | null>(null);
  const [sketch, setSketch] = useState<DocumentPicker.DocumentResult | null>(
    null,
  );
  const [referenceImages, setReferenceImages] = useState<
    (DocumentPicker.DocumentResult & { url?: string })[]
  >([]);
  const [preferredMoq, setPreferredMoq] = useState<string>('50');
  const [quantity, setQuantity] = useState<string>('1');
  const [finishNotes, setFinishNotes] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeUpload, setActiveUpload] = useState<
    'techPack' | 'sketch' | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];
  const FILE_TYPE_NAMES = {
    'application/pdf': 'PDF',
    'application/zip': 'ZIP',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/jpg': 'JPG',
  };

  const validateFile = (file: {
    size: number;
    mimeType: string;
    name: string;
  }) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 50MB limit`,
      );
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimeType)) {
      const allowedTypes = Object.values(FILE_TYPE_NAMES).join(', ');
      throw new Error(`File type not supported. Please use: ${allowedTypes}`);
    }

    // Check file name length and characters
    if (file.name.length > 100) {
      throw new Error('File name is too long. Please use a shorter name.');
    }

    const validNameRegex = /^[a-zA-Z0-9-_. ]+$/;
    if (!validNameRegex.test(file.name)) {
      throw new Error(
        'File name contains invalid characters. Please use only letters, numbers, spaces, and basic punctuation.',
      );
    }
  };

  const handleFilePick = async (
    type: 'techPack' | 'sketch' | 'reference'
  ) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setActiveUpload(type);
      setUploadProgress(0);

      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_FILE_TYPES,
        copyToCacheDirectory: true,
        multiple: type === 'reference',
      });

      if (result.canceled) {
        setLoading(false);
        setActiveUpload(null);
        return;
      }

      const files = type === 'reference' ? result.assets : [result.assets[0]];

      for (const asset of files) {
        // Validate file before upload
        validateFile(asset);

        const fileExt = asset.name.split('.').pop();
        const fileName = `${type}_${Date.now()}_${asset.name}`;
        const filePath = `${factoryId}/${fileName}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const { error: uploadError } = await supabase.storage
          .from('sample-files')
          .upload(filePath, blob, {
            contentType: asset.mimeType,
            cacheControl: '3600',
            upsert: false,
          });

        clearInterval(progressInterval);

        if (uploadError) {
          throw new Error(uploadError.message || 'Failed to upload file');
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('sample-files').getPublicUrl(filePath);

        if (type === 'techPack') {
          setTechPack({ ...result, url: publicUrl });
        } else if (type === 'sketch') {
          setSketch({ ...result, url: publicUrl });
        } else {
          setReferenceImages((prev) => [
            ...prev,
            { ...result, url: publicUrl },
          ]);
        }
      }

      setUploadProgress(100);
      setSuccess(
        `${type === 'techPack' ? 'Tech Pack' : type === 'sketch' ? 'Sketch' : 'Image'} uploaded successfully!`,
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error picking/uploading file:', err);
      setError(err.message || 'Error uploading file. Please try again.');
    } finally {
      setLoading(false);
      setActiveUpload(null);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    try {
      const moqNumber = Number(preferredMoq);
      const qtyNumber = Number(quantity);
      if (isNaN(qtyNumber) || qtyNumber <= 0) {
        setError('Please enter a valid quantity (must be greater than 0)');
        return;
      }
      if (isNaN(moqNumber) || moqNumber <= 0) {
        setError('Please enter a valid quantity (must be greater than 0)');
        return;
      }

      setLoading(true);
      setError(null);

      const formData = {
        techPack: techPack?.url || null,
        sketch: sketch?.url,
        productName: productName.trim(),
        referenceImages: referenceImages.map((r) => r.url),
        preferredMoq: moqNumber,
        quantity: qtyNumber,
        finishNotes: finishNotes.trim(),
        deliveryAddress: deliveryAddress.trim(),
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
      <Text style={styles.title}>Request Sample</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      <View style={styles.uploadSection}>
        <Text style={styles.label}>Tech Pack (Optional)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('techPack')}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>
            {techPack ? 'Change Tech Pack' : 'Upload Tech Pack'}
          </Text>
        </TouchableOpacity>
        {techPack && (
          <Text style={styles.fileName}>File: {techPack.assets[0].name}</Text>
        )}
        {loading && activeUpload === 'techPack' && (
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${uploadProgress}%` }]}
            />
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.label}>Design Sketch (Optional)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('sketch')}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>
            {sketch ? 'Change Sketch' : 'Upload Sketch'}
          </Text>
        </TouchableOpacity>
        {sketch && (
          <Text style={styles.fileName}>File: {sketch.assets[0].name}</Text>
        )}
        {loading && activeUpload === 'sketch' && (
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${uploadProgress}%` }]}
            />
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.label}>Reference Images (Optional)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={() => handleFilePick('reference')}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>Upload Images</Text>
        </TouchableOpacity>
        {referenceImages.length > 0 && (
          <Text style={styles.fileName}>
            {referenceImages.length} file{referenceImages.length > 1 ? 's' : ''} selected
          </Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
          placeholder="Product name or identifier"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preferred MOQ*</Text>
        <TextInput
          style={styles.input}
          value={preferredMoq}
          onChangeText={setPreferredMoq}
          keyboardType="numeric"
          placeholder="Minimum Order Quantity"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantity*</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Number of units"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Finish / Color Notes</Text>
        <TextInput
          style={styles.input}
          value={finishNotes}
          onChangeText={setFinishNotes}
          placeholder="Color, finish, etc."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Delivery Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Where should we send the sample?"
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any specific requirements or details"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Uploading...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  uploadSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#333',
    fontSize: 16,
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    height: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
