import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Instagram,
  Globe,
  MessageSquare,
  Image as ImageError,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import { fetchGalleryImages, fetchFactoryVideo } from '@/lib/storage';
import { Factory } from '@/types';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import BottomSheet from '@/components/shared/BottomSheet';
import SampleRequestForm from '@/components/samples/SampleRequestForm';
import OrderRequestForm from '@/components/orders/OrderRequestForm';
import ChatBottomSheet from '@/components/factory/ChatBottomSheet';

const isValidVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export default function FactoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid factory ID');
      setLoading(false);
      return;
    }
    loadFactory();
  }, [id]);

  const loadFactory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('factories')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Factory not found');
      console.log('Factory name for gallery fetch:', data.name);
      try {
        const images = await fetchGalleryImages(data.name);
        if (images.length > 0) {
          data.gallery = images;
        }
      } catch (err) {
        console.error('Error loading gallery:', err);
        // keep existing gallery data
      }

      try {
        const video = await fetchFactoryVideo(data.name);
        if (video) {
          data.video_url = video;
        }
      } catch (err) {
        console.error('Error loading video:', err);
      }

      setFactory(data);
    } catch (err) {
      console.error('Error loading factory:', err);
      setError(err instanceof Error ? err.message : 'Error loading factory');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleRequest = async (formData: any) => {
    if (!factory) return;

    try {
      setSubmitting(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create sample request with the correct schema
      const { data: sample, error: sampleError } = await supabase
        .from('samples')
        .insert({
          factory_id: factory.id,
          brand_id: user.id,
          rep_id: factory.rep_id, // Automatically assign the factory's rep
          status: 'requested',
          file_url: formData.techPack, // Use file_url instead of tech_pack_url
          comments: formData.notes,
          product_name: formData.productName,
          reference_images: formData.referenceImages,
          preferred_moq: formData.preferredMoq,
          quantity: formData.quantity,
          finish_notes: formData.finishNotes,
          delivery_address: formData.deliveryAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sampleError) throw sampleError;

      // Trigger notification to the sales rep
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sample-request-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ sampleId: sample.id }),
            },
          );
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the sample request if notification fails
      }

      // Show success message
      setSuccessMessage(
        'Sample request submitted successfully! Check your Samples page to track the status.',
      );
      setSuccess(true);
      setShowSampleForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting sample request:', err);
      setError(err instanceof Error ? err.message : 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderRequest = async (formData: any) => {
    if (!factory) return;

    try {
      setSubmitting(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          factory_id: factory.id,
          brand_id: user.id,
          status: 'pending',
          quantity: formData.quantity,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      setSuccessMessage('Order request submitted successfully!');
      setSuccess(true);
      setShowOrderForm(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting order request:', err);
      setError(err instanceof Error ? err.message : 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatPress = () => {
    setShowChat(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const openInstagram = (handle: string) => {
    Linking.openURL(`https://instagram.com/${handle.replace('@', '')}`);
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading factory details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !factory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Factory not found'}</Text>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            size="small"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Media */}
        <View style={styles.imageContainer}>
          {isValidVideoUrl(factory.video_url) ? (
            <WebView
              testID="factory-video"
              source={{ uri: factory.video_url! }}
              style={styles.headerVideo}
              allowsFullscreenVideo
            />
          ) : factory.featured_image && !imageError ? (
            <Image
              source={{ uri: factory.featured_image }}
              style={styles.headerImage}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View style={[styles.headerImage, styles.errorContainer]}>
              <ImageError size={48} color={Colors.neutral[400]} />
              <Text style={styles.errorText}>Image not available</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Factory Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={[Typography.h1, styles.name]}>{factory.name}</Text>
            {factory.verified && <Badge label="Verified" variant="verified" />}
          </View>

          <Text style={[Typography.body, styles.location]}>
            {factory.location}
          </Text>

          {/* Social Links */}
          <View style={styles.socialLinks}>
            {factory.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openInstagram(factory.instagram!)}
              >
                <Instagram size={20} color={Colors.primary[500]} />
                <Text style={styles.socialText}>{factory.instagram}</Text>
              </TouchableOpacity>
            )}
            {factory.website && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openWebsite(factory.website!)}
              >
                <Globe size={20} color={Colors.primary[500]} />
                <Text style={styles.socialText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[Typography.h3, styles.sectionTitle]}>About</Text>
            <Text style={[Typography.body, styles.description]}>
              {factory.description}
            </Text>
          </View>
          {factory.founder_story && (
            <View style={styles.section}>
              <Text style={[Typography.h3, styles.sectionTitle]}>
                Founder Story
              </Text>
              <Text style={[Typography.body, styles.description]}>
                {factory.founder_story}
              </Text>
            </View>
          )}

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={[Typography.h3, styles.sectionTitle]}>
              Specifications
            </Text>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Minimum Order:</Text>
              <Text style={styles.specValue}>
                {factory.minimum_order_quantity} units
              </Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Leather Types:</Text>
              <View style={styles.tagContainer}>
                {factory.leather_types.map((type, index) => (
                  <Badge key={index} label={type} variant="tag" />
                ))}
              </View>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Tanning:</Text>
              <View style={styles.tagContainer}>
                {factory.tanning_types.map((type, index) => (
                  <Badge key={index} label={type} variant="tag" />
                ))}
              </View>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Finishes:</Text>
              <View style={styles.tagContainer}>
                {factory.finishes.map((finish, index) => (
                  <Badge key={index} label={finish} variant="tag" />
                ))}
              </View>
            </View>
            {factory.delivery_timeline && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Delivery Timeline:</Text>
                <Text style={styles.specValue}>
                  {factory.delivery_timeline}
                </Text>
              </View>
            )}
            {factory.certifications && factory.certifications.length > 0 && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Certifications:</Text>
                <View style={styles.tagContainer}>
                  {factory.certifications.map((cert, index) => (
                    <Badge key={index} label={cert} variant="tag" />
                  ))}
                </View>
              </View>
            )}
            {factory.tech_pack_guide && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Tech Pack Guide:</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(factory.tech_pack_guide!)}
                >
                  <Text style={styles.linkText}>Download</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Gallery */}
          {factory.gallery && factory.gallery.length > 0 && (
            <View style={styles.section}>
              <Text style={[Typography.h3, styles.sectionTitle]}>Gallery</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.gallery}
              >
                {factory.gallery.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <CustomButton
          title="Request Sample"
          variant="primary"
          style={styles.actionButton}
          onPress={() => setShowSampleForm(true)}
          loading={submitting}
        />
        <CustomButton
          title="Place Order"
          variant="primary"
          style={styles.actionButton}
          onPress={() => setShowOrderForm(true)}
          loading={submitting}
        />
        <CustomButton
          title="Chat"
          variant="outline"
          icon={<MessageSquare size={20} color={Colors.primary[500]} />}
          style={styles.actionButton}
          onPress={handleChatPress}
        />
      </View>

      {/* Sample Request Form */}
      <BottomSheet
        isVisible={showSampleForm}
        onClose={() => setShowSampleForm(false)}
        title="Request Sample"
        height="90%"
      >
        <SampleRequestForm
          factoryId={factory?.id || ''}
          onSubmit={handleSampleRequest}
          onClose={() => setShowSampleForm(false)}
        />
      </BottomSheet>

      {/* Order Request Form */}
      <BottomSheet
        isVisible={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        title="Place Order"
        height="70%"
      >
        <OrderRequestForm
          factoryId={factory?.id || ''}
          onSubmit={handleOrderRequest}
          onClose={() => setShowOrderForm(false)}
        />
      </BottomSheet>

      {/* Chat Modal */}
      <ChatBottomSheet
        isVisible={showChat}
        onClose={() => setShowChat(false)}
        factoryId={factory?.id || ''}
        factoryName={factory?.name || ''}
      />

      {/* Success Message */}
      {success && (
        <View style={styles.successContainer}>
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.viewSamplesButton}
              onPress={() => router.push('/brand/tabs/samples')}
            >
              <Text style={styles.viewSamplesButtonText}>View Samples</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.neutral[200],
  },
  headerVideo: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.neutral[200],
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  location: {
    color: Colors.neutral[600],
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  socialText: {
    marginLeft: 8,
    color: Colors.primary[500],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  description: {
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  specRow: {
    marginBottom: 16,
  },
  specLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  specValue: {
    ...Typography.body,
    color: Colors.neutral[900],
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gallery: {
    marginHorizontal: -20,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  linkText: {
    color: Colors.primary[500],
    textDecorationLine: 'underline',
  },
  successContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  successMessage: {
    backgroundColor: Colors.status.success + 'F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  successText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  viewSamplesButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  viewSamplesButtonText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
