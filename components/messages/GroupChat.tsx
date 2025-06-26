import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import ChatInput from './ChatInput';
import MessageTemplates from './MessageTemplates';
import { supabase } from '@/lib/supabase';
import ChatBubble from './ChatBubble';
import { User } from '@supabase/supabase-js';
import { AuthResponse } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { Message, DatabaseMessage } from '@/types';

interface GroupChatProps {
  orderId?: string;
  sampleId?: string;
  onError?: (error: string) => void;
}

interface ExtendedMessage extends Message {
  sender: {
    id: string;
    email: string;
  };
}

interface ExtendedDatabaseMessage extends DatabaseMessage {
  sender: Array<{
    id: string;
    email: string;
  }>;
}

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export default function GroupChat({ orderId, sampleId, onError }: GroupChatProps) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId && !sampleId) {
      const errorMsg = 'No chat ID provided';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const loadInitialData = async () => {
      try {
        // First, try to find an existing chat
        const { data: existingChats, error: chatError } = await supabase
          .from('group_chats')
          .select('id, created_at')
          .eq(orderId ? 'order_id' : 'sample_id', orderId || sampleId)
          .order('created_at', { ascending: false });

        if (chatError) {
          throw new Error(chatError.message);
        }

        let chatData;
        
        if (!existingChats || existingChats.length === 0) {
          // Create a new chat if none exists
          const { data: newChat, error: createError } = await supabase
            .from('group_chats')
            .insert({
              [orderId ? 'order_id' : 'sample_id']: orderId || sampleId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (createError) {
            throw new Error(createError.message);
          }
          chatData = newChat;
        } else {
          // Use the most recent chat
          chatData = existingChats[0];
        }

        if (!chatData?.id) {
          throw new Error('Failed to get or create chat');
        }

        setChatId(chatData.id);
        await loadMessages(chatData.id);
        await loadTemplates();

        // Subscribe to new messages
        const channel = supabase
          .channel(`messages:${chatData.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatData.id}`,
          }, (payload) => {
            setMessages((current) => [...current, payload.new as ExtendedMessage]);
            scrollToBottom();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to initialize chat';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    loadInitialData();
  }, [orderId, sampleId]);

  const loadMessages = async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          text,
          attachments,
          created_at,
          sender:sender_id (
            id,
            email
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw new Error(messagesError.message);
      }

      // Format the messages to match ExtendedMessage interface
      const formattedMessages: ExtendedMessage[] = (messages || []).map((msg: any) => {
        const senderData = msg.sender?.[0] || { id: msg.sender_id, email: '' };
        return {
          id: msg.id,
          chat_id: msg.chat_id,
          sender_id: msg.sender_id,
          text: msg.text,
          attachments: msg.attachments || [],
          created_at: msg.created_at,
          sender: {
            id: senderData.id,
            email: senderData.email
          }
        };
      });

      setMessages(formattedMessages);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('category');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSend = async (message: string, attachment?: { uri: string; type: string; name: string }) => {
    if ((!message.trim() && !attachment) || !chatId || !session?.user) return;
    try {
      setSending(true);
      let uploadedUrl: string | undefined;
      let blob;
      if (attachment) {
        if (attachment.uri.startsWith('data:')) {
          // Web: convert data URL to Blob
          blob = dataURLtoBlob(attachment.uri);
        } else {
          // Native: fetch and get blob
          const response = await fetch(attachment.uri);
          blob = await response.blob();
        }
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${chatId}_${Date.now()}.${fileExt}`;
        const filePath = `${chatId}/${fileName}`;
        const contentType = attachment.type || blob.type || 'image/jpeg';
        console.log('Uploading blob:', blob, 'with contentType:', contentType);
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, blob, { contentType });
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from('chat-images').getPublicUrl(filePath);
        uploadedUrl = publicUrl;
      }
      const user = session.user;
      const messageData = {
        chat_id: chatId,
        sender_id: user.id,
        text: message.trim(),
        attachments: uploadedUrl ? [uploadedUrl] : [],
      };
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          id,
          chat_id,
          sender_id,
          text,
          attachments,
          created_at,
          sender:sender_id (
            id,
            email
          )
        `)
        .single();
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      if (data) {
        const typedData = data as unknown as ExtendedDatabaseMessage;
        const senderData = typedData.sender[0] || { id: user.id, email: user.email || '' };
        const formattedMessage: ExtendedMessage = {
          id: typedData.id,
          chat_id: typedData.chat_id,
          sender_id: typedData.sender_id,
          text: typedData.text,
          attachments: typedData.attachments || [],
          created_at: typedData.created_at,
          sender: {
            id: senderData.id,
            email: senderData.email
          }
        };
        setMessages(prev => [...prev, formattedMessage]);
      }
      scrollToBottom();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error sending message';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    handleSend(template.content);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            timestamp={message.created_at}
            isOutgoing={message.sender?.id === session?.user?.id}
            attachments={message.attachments || []}
          />
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <ChatInput
          onSend={handleSend}
          disabled={sending}
          placeholder={sending ? 'Sending...' : 'Type a message...'}
        />
        {templates.length > 0 && (
          <MessageTemplates
            templates={templates}
            onSelect={handleTemplateSelect}
          />
        )}
      </View>
    </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});