import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';
import { Factory, LeatherType, TanningType, FinishType, ProductCategory } from '@/types';
import { supabase } from '@/lib/supabase';

type GalleryFile = {
  uri: string;
  name: string;
  mimeType: string;
  error?: boolean;
};

interface Props {
  initialData?: Partial<Factory>;
  onSubmit: (data: Partial<Factory>) => Promise<void>;
  submitting?: boolean;
}

const validateEnumArray = <T extends string>(values: string[], enumObj: { [key: string]: T }): T[] => {
  const validValues = Object.values(enumObj);
  return values
    .map(v => v.trim())
    .filter(v => validValues.includes(v as T)) as T[];
};

export default function FactoryProfileForm({
  initialData,
  onSubmit,
  submitting,
}: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [founderStory, setFounderStory] = useState(initialData?.founder_story || '');
  const [productTypes, setProductTypes] = useState<ProductCategory[]>(initialData?.product_categories || []);
  const [moq, setMoq] = useState(initialData?.minimum_order_quantity?.toString() || '');
  const [deliveryTimeline, setDeliveryTimeline] = useState(initialData?.delivery_timeline || '');
  const [certifications, setCertifications] = useState(
    (initialData?.certifications || []).join(', '),
  );
  const [leatherTypes, setLeatherTypes] = useState<LeatherType[]>(initialData?.leather_types || []);
  const [tanningTypes, setTanningTypes] = useState<TanningType[]>(initialData?.tanning_types || []);
  const [finishes, setFinishes] = useState<FinishType[]>(initialData?.finishes || []);
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '');
  const [galleryFiles, setGalleryFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [selectedPdfFile, setSelectedPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickGallery = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newAssets = result.assets.filter(
        (newFile) => !galleryFiles.some((existing) => existing.uri === newFile.uri)
      );
      
      setGalleryFiles((prev) => [...prev, ...newAssets]);
    }
  };

  const handlePdfPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      console.log('Selected PDF file:', {
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        uri: file.uri
      });
      
      const mimeType = file.mimeType?.toLowerCase() || '';
      
      if (!mimeType.includes('pdf')) {
        Alert.alert('Error', 'Please select a PDF file');
        return;
      }

      setSelectedPdfFile(file);
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to select PDF file');
    }
  };

  const handleRemovePdf = () => {
    setSelectedPdfFile(null);
  };

  const handleImageError = (index: number) => {
    // For now, just log the error since we can't modify the DocumentPickerAsset type
    console.error(`Image at index ${index} failed to load`);
  };

  const uploadGalleryImage = async (file: DocumentPicker.DocumentPickerAsset): Promise<string> => {
    try {
      // Validate file type
      if (!file.mimeType?.toLowerCase().includes('image/')) {
        throw new Error('Only image files are allowed for gallery');
      }

      // Create the file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}.${fileExt}`;
      const filePath = `factories/gallery/${fileName}`;

      // Use the exact same approach as the working invoice upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, { contentType: file.mimeType });

      if (uploadError) {
        console.error('Gallery image upload error:', uploadError);
        throw new Error('Failed to upload gallery image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Gallery image upload error:', error);
      throw new Error('Failed to upload gallery image');
    }
  };

  const uploadTechPackFile = async (file: DocumentPicker.DocumentPickerAsset): Promise<string> => {
    try {
      console.log('Uploading tech pack file:', {
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        uri: file.uri
      });

      // Validate file type
      if (!file.mimeType?.toLowerCase().includes('pdf')) {
        throw new Error('Only PDF files are allowed for tech packs');
      }

      // Create the file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Fetching file from URI:', file.uri);
      
      // Try a different approach - convert to array buffer first
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();
      
      // Create blob from array buffer with explicit type
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      console.log('Created blob:', {
        size: blob.size,
        type: blob.type
      });

      // Use the dedicated tech-pack-guides bucket
      const { error: uploadError } = await supabase.storage
        .from('tech-pack-guides')
        .upload(filePath, blob, { contentType: 'application/pdf' });

      if (uploadError) {
        console.error('Tech pack upload error:', uploadError);
        throw new Error('Failed to upload tech pack file');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('tech-pack-guides')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Tech pack upload error:', error);
      throw new Error('Failed to upload tech pack file');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Upload tech pack if selected
      let techPackGuide = initialData?.tech_pack_guide;
      if (selectedPdfFile) {
        techPackGuide = await uploadTechPackFile(selectedPdfFile);
      }

      // Upload gallery images if any new ones are selected
      const existingGallery = initialData?.gallery || [];
      const newGalleryUrls = await Promise.all(
        galleryFiles.map(file => uploadGalleryImage(file))
      );
      const galleryUrls = [...existingGallery, ...newGalleryUrls];

      // Parse certifications from comma-separated string
      const certificationsArray = certifications
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0);

      const factoryData: Partial<Factory> = {
        name,
        location,
        description,
        founder_story: founderStory,
        product_categories: productTypes,
        minimum_order_quantity: moq ? parseInt(moq) : undefined,
        delivery_timeline: deliveryTimeline || undefined,
        certifications: certificationsArray.length > 0 ? certificationsArray : undefined,
        leather_types: leatherTypes,
        tanning_types: tanningTypes,
        finishes,
        gallery: galleryUrls,
        tech_pack_guide: techPackGuide,
        instagram: initialData?.instagram || '',
        website: initialData?.website || '',
        video_url: videoUrl,
        featured_image: initialData?.featured_image || '',
      };

      await onSubmit(factoryData);
    } catch (error) {
      console.error('Error saving factory:', error);
      Alert.alert('Error', 'Failed to save factory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper text components to show valid options
  const renderValidOptions = (label: string, options: string[]) => (
    <Text style={styles.helperText}>
      Valid {label}: {options.join(', ')}
    </Text>
  );

  const renderPdfSection = () => {
    const hasExistingPdf = !!selectedPdfFile;
    
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Tech Pack Guide (PDF)</Text>
        {hasExistingPdf ? (
          <View style={styles.pdfContainer}>
            <View style={styles.pdfInfo}>
              <Ionicons name="document-text" size={24} color={Colors.primary[500]} />
              <Text style={styles.pdfName} numberOfLines={1}>
                {selectedPdfFile?.name || 'Existing PDF'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemovePdf}>
              <Ionicons name="close-circle" size={24} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        ) : (
          <CustomButton
            title="Select PDF"
            onPress={handlePdfPick}
            variant="outline"
            loading={isSaving}
            disabled={isSaving}
          />
        )}
      </View>
    );
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Factory Preview</Text>
        <View style={styles.previewContent}>
          <Text style={styles.previewLabel}>Name:</Text>
          <Text style={styles.previewValue}>{name}</Text>

          <Text style={styles.previewLabel}>Location:</Text>
          <Text style={styles.previewValue}>{location}</Text>

          <Text style={styles.previewLabel}>Description:</Text>
          <Text style={styles.previewValue}>{description}</Text>

          <Text style={styles.previewLabel}>Founder Story:</Text>
          <Text style={styles.previewValue}>{founderStory}</Text>

          <Text style={styles.previewLabel}>Product Types:</Text>
          <Text style={styles.previewValue}>{productTypes.join(', ')}</Text>

          <Text style={styles.previewLabel}>Minimum Order Quantity:</Text>
          <Text style={styles.previewValue}>{moq}</Text>

          <Text style={styles.previewLabel}>Leather Types:</Text>
          <Text style={styles.previewValue}>{leatherTypes.join(', ')}</Text>

          <Text style={styles.previewLabel}>Tanning Types:</Text>
          <Text style={styles.previewValue}>{tanningTypes.join(', ')}</Text>

          <Text style={styles.previewLabel}>Finishes:</Text>
          <Text style={styles.previewValue}>{finishes.join(', ')}</Text>

          <Text style={styles.previewLabel}>Gallery Images:</Text>
          <Text style={styles.previewValue}>{galleryFiles.length} images selected</Text>
          
          {galleryFiles.length > 0 && (
            <ScrollView horizontal style={styles.previewImageContainer}>
              {galleryFiles.map((file, index) => (
                <Image
                  key={index}
                  source={{ uri: file.uri }}
                  style={styles.previewThumbnail}
                />
              ))}
            </ScrollView>
          )}

          <Text style={styles.previewLabel}>Tech Pack:</Text>
          <Text style={styles.previewValue}>{selectedPdfFile?.name || 'No file selected'}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Factory Name"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Founder Story</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={founderStory}
            onChangeText={setFounderStory}
            multiline
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Types (comma separated)*</Text>
          <TextInput
            style={styles.input}
            value={productTypes.join(', ')}
            onChangeText={text => setProductTypes(text.split(', ').map(t => t.trim() as ProductCategory))}
            placeholder="e.g. Bags, Jackets"
          />
          {renderValidOptions('product types', Object.values(ProductCategory))}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Minimum Order Quantity</Text>
          <TextInput
            style={styles.input}
            value={moq}
            onChangeText={setMoq}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Delivery Timeline</Text>
          <TextInput
            style={styles.input}
            value={deliveryTimeline}
            onChangeText={setDeliveryTimeline}
            placeholder="e.g. 4-6 weeks"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Certifications (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={certifications}
            onChangeText={setCertifications}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Leather Types (comma separated)*</Text>
          <TextInput
            style={styles.input}
            value={leatherTypes.join(', ')}
            onChangeText={text => setLeatherTypes(text.split(', ').map(t => t.trim() as LeatherType))}
            placeholder="e.g. CowHide, LambSkin"
          />
          {renderValidOptions('leather types', Object.values(LeatherType))}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tanning Processes (comma separated)*</Text>
          <TextInput
            style={styles.input}
            value={tanningTypes.join(', ')}
            onChangeText={text => setTanningTypes(text.split(', ').map(t => t.trim() as TanningType))}
            placeholder="e.g. Chrome, Vegetable"
          />
          {renderValidOptions('tanning types', Object.values(TanningType))}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Finishes (comma separated)*</Text>
          <TextInput
            style={styles.input}
            value={finishes.join(', ')}
            onChangeText={text => setFinishes(text.split(', ').map(t => t.trim() as FinishType))}
            placeholder="e.g. Distressed, Polished"
          />
          {renderValidOptions('finishes', Object.values(FinishType))}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Video Link (optional)</Text>
          <TextInput
            style={styles.input}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Gallery Images (8-12)</Text>
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              galleryFiles.length >= 12 && styles.uploadButtonDisabled
            ]} 
            onPress={handlePickGallery}
            disabled={galleryFiles.length >= 12}
          >
            <Text style={styles.uploadText}>
              {galleryFiles.length > 0 ? 'Add More Images' : 'Upload Images'}
            </Text>
          </TouchableOpacity>
          {galleryFiles.length > 0 && (
            <Text style={styles.fileName}>
              {galleryFiles.length} files selected ({8 - galleryFiles.length > 0 
                ? `${8 - galleryFiles.length} more required` 
                : `${12 - galleryFiles.length} more allowed`})
            </Text>
          )}
          {galleryFiles.length > 0 && (
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {galleryFiles.map((g, idx) => (
                <View key={idx} style={styles.imagePreviewWrapper}>
                  <Image
                    source={{ uri: g.uri }}
                    style={styles.previewImage}
                    onError={() => handleImageError(idx)}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        {renderPdfSection()}
        <View style={styles.buttonContainer}>
          <CustomButton
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
            onPress={() => setShowPreview(!showPreview)}
            variant="outline"
            style={styles.previewButton}
          />
          <CustomButton
            title={isSaving ? "Saving..." : "Save Factory"}
            onPress={handleSubmit}
            disabled={isSaving}
            loading={isSaving}
          />
        </View>
        {renderPreview()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.neutral[50],
  },
  form: {
    gap: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.body,
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.neutral[50],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: Colors.status.errorLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.neutral[200],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    color: Colors.neutral[800],
  },
  fileName: {
    color: Colors.neutral[600],
    fontSize: 12,
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  previewBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
  },
  previewTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  previewSubtitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  previewDesc: {
    ...Typography.body,
    marginBottom: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  imagePreviewContainer: {
    marginTop: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  previewImageError: {
    backgroundColor: Colors.neutral[200],
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 20,
    backgroundColor: Colors.neutral[200],
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: Colors.neutral[800],
    fontSize: 12,
    lineHeight: 20,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginTop: 4,
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  pdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pdfName: {
    ...Typography.body,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  previewButton: {
    flex: 1,
  },
  previewContainer: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  previewContent: {
    gap: 12,
  },
  previewLabel: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.neutral[600],
  },
  previewValue: {
    ...Typography.body,
    color: Colors.neutral[900],
  },
  previewImageContainer: {
    marginTop: 8,
  },
  previewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
  },
});

