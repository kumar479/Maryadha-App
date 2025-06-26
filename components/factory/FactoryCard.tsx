import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ImageError } from 'lucide-react-native';
import { Factory } from '@/types';
import Badge from '@/components/shared/Badge';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { fetchFactoryImage } from '@/lib/storage';

interface FactoryCardProps {
  factory: Factory;
  onPress?: (factoryId: string) => void;
}

export default function FactoryCard({ factory, onPress }: FactoryCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    factory.featured_image,
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const url = await fetchFactoryImage(factory.name);
      if (isMounted && url) {
        setImageUrl(url);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [factory.name]);
  
  const handlePress = () => {
    if (onPress) {
      onPress(factory.id);
    } else {
      router.push(`/brand/tabs/factories/${factory.id}`);
    }
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

  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
      testID="factory-card"
    >
      {isValidImageUrl(imageUrl) && !imageError ? (
        <Image
          source={{
            uri: imageUrl!,
            headers: {
              Accept: 'image/webp,image/jpeg,image/png,image/gif'
            }
          }}
          style={styles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <View style={[styles.image, styles.errorContainer]}>
          <ImageError size={32} />
          <Text style={styles.errorText}>Image not available</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[Typography.h4, styles.name]} numberOfLines={1}>
            {factory.name}
          </Text>
          {factory.verified && (
            <Badge label="Verified" variant="verified" />
          )}
        </View>
        
        <Text style={[Typography.bodySmall, styles.location]} numberOfLines={1}>
          {factory.location}
        </Text>
        
        <View style={styles.details}>
          <Text style={[Typography.bodySmall, styles.moq]}>
            MOQ: {factory.minimum_order_quantity} units
          </Text>
          
          <View style={styles.tags}>
            {(factory.leather_types || []).slice(0, 2).map((type, index) => (
              <Badge key={index} label={type} variant="tag" />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutral[200],
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: Colors.neutral[500],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  location: {
    color: Colors.neutral[600],
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  moq: {
    color: Colors.neutral[700],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});