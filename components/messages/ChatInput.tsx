import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Text } from 'react-native';
import { Send, Paperclip, X, Smile } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
// You may need to install emoji-mart-native or use a simple emoji picker
// import EmojiPicker from 'emoji-mart-native';

interface ChatInputProps {
  onSend: (message: string, attachment?: { uri: string; type: string; name: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export default function ChatInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  testID,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [draftAttachment, setDraftAttachment] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        setDraftAttachment({
          uri: asset.uri,
          type: 'image/jpeg',
          name: fileName,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRemoveAttachment = () => {
    setDraftAttachment(null);
  };

  const handleSend = (text: string) => {
    if ((text.trim() || draftAttachment) && !disabled) {
      onSend(text.trim(), draftAttachment || undefined);
      setMessage('');
      setDraftAttachment(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.attachButton}
        onPress={handleAttachment}
        disabled={disabled}
        testID="attach-button"
      >
        <View style={{ opacity: disabled ? 0.5 : 1 }}>
          <Paperclip size={20} />
        </View>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled
        ]}
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral[400]}
        multiline
        maxLength={1000}
        editable={!disabled}
        testID={testID || "message-input"}
      />

      <TouchableOpacity
        style={styles.emojiButton}
        onPress={() => setShowEmojiPicker((v) => !v)}
        disabled={disabled}
        testID="emoji-button"
      >
        <Smile size={20} />
      </TouchableOpacity>

      {/* Emoji Picker (pseudo-code, replace with your picker) */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          {/* Replace below with your emoji picker component */}
          {/* <EmojiPicker onEmojiSelected={handleEmojiSelect} /> */}
          <Text onPress={() => handleEmojiSelect('😀')}>😀</Text>
          <Text onPress={() => handleEmojiSelect('🎉')}>🎉</Text>
          <Text onPress={() => handleEmojiSelect('👍')}>👍</Text>
        </View>
      )}

      {draftAttachment && (
        <View style={styles.attachmentPreview}>
          <Image source={{ uri: draftAttachment.uri }} style={styles.attachmentImage} />
          <TouchableOpacity onPress={handleRemoveAttachment} style={styles.removeAttachmentButton}>
            <X size={16} color={Colors.status.error} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.sendButton,
          ((!message.trim() && !draftAttachment) || disabled) && styles.sendButtonDisabled
        ]}
        onPress={() => handleSend(message)}
        disabled={(!message.trim() && !draftAttachment) || disabled}
        testID="send-button"
      >
        <Send size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    position: 'relative',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: Colors.neutral[200],
  },
  attachButton: {
    padding: 10,
  },
  emojiButton: {
    padding: 8,
    marginRight: 2,
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: Colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  attachmentPreview: {
    position: 'absolute',
    left: 60,
    bottom: 60,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 4,
  },
  removeAttachmentButton: {
    padding: 4,
  },
});