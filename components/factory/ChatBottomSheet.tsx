import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { supabase } from '../../lib/supabase';
import BottomSheet from '../shared/BottomSheet';
import ChatInput from '../messages/ChatInput';
import GroupChat from '../messages/GroupChat';
import Colors from '../../constants/Colors';
import { MessageData } from '../../types';

interface ChatBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  chatId: string | null;
}

export default function ChatBottomSheet({
  isVisible,
  onClose,
  chatId,
}: ChatBottomSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (message: string, attachment?: { uri: string; type: string; name: string }) => {
    if (!message.trim() && !attachment || !chatId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData?.user) {
        throw new Error('Not authenticated');
      }

      const user = userData.user;

      // If there's an attachment, upload it first
      let attachmentUrl = '';
      if (attachment) {
        const fileName = `${chatId}/${Date.now()}-${attachment.name}`;
        
        // Convert the file to a Blob
        const response = await fetch(attachment.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        if (uploadData?.path) {
          const { data } = await supabase.storage
            .from('chat-attachments')
            .getPublicUrl(uploadData.path);
          attachmentUrl = data.publicUrl;
        }
      }

      // Send message to sync function
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sync-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          sender_id: user.id,
          text: message.trim(),
          attachments: attachmentUrl ? [attachmentUrl] : []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`);
      }

      // Clear any previous errors on successful send
      setError(null);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      height="90%"
    >
      <View style={styles.container}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {chatId && (
          <GroupChat 
            orderId={chatId} 
            onError={handleError}
          />
        )}
        <ChatInput
          onSend={handleSend}
          onAttach={() => {}}
          disabled={loading || !chatId}
          placeholder="Type a message..."
          testID="chat-input"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: Colors.status.errorLight,
    marginBottom: 10,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    textAlign: 'center',
  },
});