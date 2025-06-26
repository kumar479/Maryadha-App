import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Text, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

export default function BottomSheet({ 
  isVisible, 
  onClose, 
  title, 
  children,
  height = '70%'
}: BottomSheetProps) {
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { 
        duration: 300,
        easing: Easing.out(Easing.cubic)
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(1000, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, overlayStyle]} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[styles.bottomSheet, animatedStyle, { height }]}>
          <View style={styles.header}>
            {title && <Text style={[Typography.h4, styles.title]}>{title}</Text>}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="close-button"
            >
              <X color={Colors.neutral[900]} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.handle}></View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.neutral[300],
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
});