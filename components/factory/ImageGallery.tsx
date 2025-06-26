import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface ImageGalleryProps {
  images: string[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((imageUri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageContainer}
            onPress={() => openModal(index)}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setModalVisible(false)}
          >
            <X color="white" size={24} />
          </TouchableOpacity>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
            contentOffset={{ x: selectedIndex * screenWidth, y: 0 }}
          >
            {images.map((imageUri, index) => (
              <View key={index} style={styles.modalImageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[200],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalScrollContent: {
    flexDirection: 'row',
  },
  modalImageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: screenWidth,
    height: '80%',
  },
});