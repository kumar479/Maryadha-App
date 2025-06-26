import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, Instagram, Globe, Image as ImageError } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Badge from '@/components/shared/Badge';
import CustomButton from '@/components/shared/CustomButton';
import ImageGallery from '@/components/factory/ImageGallery';
import BottomSheet from '@/components/shared/BottomSheet';
import SampleRequestForm from '@/components/samples/SampleRequestForm';
import ChatBottomSheet from '@/components/factory/ChatBottomSheet';
import factoriesData from '@/data/factoriesData';
import { WebView } from 'react-native-webview';

export default function FactoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [noResponseTimer, setNoResponseTimer] = useState<NodeJS.Timeout | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  const factory = factoriesData.find(f => f.id === id);
  
  useEffect(() => {
    if (isChatModalVisible) {
      const timer = setTimeout(() => {
        setShowWhatsApp(true);
      }, 5 * 60 * 1000);
      
      setNoResponseTimer(timer);
    } else {
      if (noResponseTimer) {
        clearTimeout(noResponseTimer);
        setNoResponseTimer(null);
      }
      setShowWhatsApp(false);
    }
    
    return () => {
      if (noResponseTimer) {
        clearTimeout(noResponseTimer);
      }
    };
  }, [isChatModalVisible]);
  
  if (!factory) {
    return (
      <View style={styles.container}>
        <Text>Factory not found</Text>
      </View>
    );
  }
  
  const handleGoBack = () => {
    router.back();
  };
  
  const openWhatsApp = () => {
    const message = `Hi, I'm interested in ${factory.name} via Maryadha. Can someone assist?`;
    const whatsappUrl = `https://wa.me/911234567890?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          alert("WhatsApp is not installed on your device");
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const openInstagram = () => {
    const instagramUrl = `https://instagram.com/${factory.instagram?.replace('@', '')}`;
    Linking.openURL(instagramUrl);
  };

  const openWebsite = () => {
    Linking.openURL(factory.website || '');
  };
  
  const toggleStoryExpand = () => {
    setStoryExpanded(!storyExpanded);
  };
  
  const handleRequestSample = () => {
    setIsRequestModalVisible(true);
  };
  
  const handleSubmitRequest = (formData: any) => {
    console.log('Sample request submitted:', formData);
    setIsRequestModalVisible(false);
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
    }, 3000);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleChatPress = () => {
    setIsChatModalVisible(true);
  };

  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return (
        urlObj.protocol === 'https:' &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname)
      );
    } catch {
      return false;
    }
  };

  const isValidVideoUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return (
        urlObj.protocol === 'https:' &&
        /\.(mp4|webm)$/i.test(urlObj.pathname)
      );
    } catch {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Video/Image */}
        <View style={styles.imageContainer}>
          {isValidVideoUrl(factory.videoUrl) ? (
            <WebView
              style={styles.headerVideo}
              source={{ uri: factory.videoUrl }}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          ) : isValidImageUrl(factory.featuredImage) && !imageError ? (
            <Image 
              source={{ 
                uri: factory.featuredImage,
                headers: {
                  Accept: 'image/webp,image/jpeg,image/png,image/gif'
                }
              }} 
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
            onPress={handleGoBack}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
        </View>
        
        {/* Factory Info */}
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <Text style={[Typography.h2, styles.name]} numberOfLines={2}>{factory.name}</Text>
              {factory.verified && (
                <Badge label="Verified" variant="verified" />
              )}
            </View>
            <Text style={[Typography.bodySmall, styles.location]} numberOfLines={1}>{factory.location}</Text>
            
            {/* Social Links */}
            <View style={styles.socialLinks}>
              {factory.instagram && (
                <TouchableOpacity style={styles.socialButton} onPress={openInstagram}>
                  <Instagram size={20} color={Colors.primary[500]} />
                  <Text style={styles.socialText}>{factory.instagram}</Text>
                </TouchableOpacity>
              )}
              {factory.website && (
                <TouchableOpacity style={styles.socialButton} onPress={openWebsite}>
                  <Globe size={20} color={Colors.primary[500]} />
                  <Text style={styles.socialText}>Visit Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Our Story */}
          <View style={styles.storySection}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Our Story</Text>
            <Text 
              style={[Typography.body, styles.storyText]}
              numberOfLines={storyExpanded ? undefined : 3}
            >
              {factory.story}
            </Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleStoryExpand}
            >
              <Text style={styles.expandButtonText}>
                {storyExpanded ? 'Read Less' : 'Read More'}
              </Text>
              {storyExpanded ? (
                <ChevronUp size={16} color={Colors.primary[500]} />
              ) : (
                <ChevronDown size={16} color={Colors.primary[500]} />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Gallery */}
          <View style={styles.gallerySection}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Gallery</Text>
            <ImageGallery images={factory.gallery} />
          </View>
          
          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Specifications</Text>
            
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.detailLabel]}>MOQ:</Text>
              <Text style={[Typography.body, styles.detailValue]}>{factory.moq} units</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.detailLabel]}>Leather Types:</Text>
              <View style={styles.detailValueContainer}>
                {factory.leatherTypes.map((type, index) => (
                  <Text key={index} style={[Typography.body, styles.detailValue]}>
                    {type}{index < factory.leatherTypes.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>
            </View>
            
            {factory.certifications.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, styles.detailLabel]}>Certifications:</Text>
                <View style={styles.detailValueContainer}>
                  {factory.certifications.map((cert, index) => (
                    <Text key={index} style={[Typography.body, styles.detailValue]}>
                      {cert}{index < factory.certifications.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.tagsContainer}>
              {factory.tags.map((tag, index) => (
                <Badge key={index} label={tag} variant="tag" />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Sticky Action Bar */}
      <View style={styles.actionBar}>
        <CustomButton
          title="Talk to Sourcing Expert"
          variant="primary"
          icon={<MessageSquare size={20} color="white" />}
          style={styles.chatButton}
          onPress={handleChatPress}
        />
        <CustomButton
          title="Request Sample"
          variant="outline"
          style={styles.requestButton}
          onPress={handleRequestSample}
        />
      </View>
      
      {/* Sample Request Modal */}
      <BottomSheet
        isVisible={isRequestModalVisible}
        onClose={() => setIsRequestModalVisible(false)}
        title="Request a Sample"
        height="90%"
      >
        <SampleRequestForm
          factoryId={factory.id}
          onSubmit={handleSubmitRequest}
        />
      </BottomSheet>
      
      {/* Chat Modal */}
      <ChatBottomSheet
        isVisible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
        factoryName={factory.name}
        factoryId={factory.id}
        showWhatsApp={showWhatsApp}
        onWhatsAppPress={openWhatsApp}
      />
      
      {/* Success Message */}
      {requestSubmitted && (
        <View style={styles.successContainer}>
          <View style={styles.successMessage}>
            <Text style={styles.successText}>
              Sample request sent successfully!
            </Text>
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
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerRow: {
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
    color: Colors.neutral[500],
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  sectionTitle: {
    marginBottom: 16,
  },
  storySection: {
    marginBottom: 24,
  },
  storyText: {
    lineHeight: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.primary[500],
    marginRight: 4,
  },
  gallerySection: {
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 100,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 100,
    color: Colors.neutral[700],
  },
  detailValueContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailValue: {
    color: Colors.neutral[900],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 4,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px -3px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  chatButton: {
    flex: 1,
    marginRight: 8,
  },
  requestButton: {
    flex: 1,
    marginLeft: 8,
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[200],
  },
  errorText: {
    marginTop: 12,
    color: Colors.neutral[500],
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
});