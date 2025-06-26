import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Paperclip, Send } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import ChatBubble from '@/components/messages/ChatBubble';
import CustomButton from '@/components/shared/CustomButton';
import { getConversation } from '@/data/messagesData';
import factoriesData from '@/data/factoriesData';
import { Message } from '@/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeSinceReply, setTimeSinceReply] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const factory = factoriesData.find(f => f.id === id);
  
  useEffect(() => {
    if (id) {
      // Load conversation data
      const conversation = getConversation(id);
      setMessages(conversation);
      
      // Simulate time since last factory reply
      setTimeSinceReply(Math.floor(Math.random() * 15)); // 0-15 minutes for demo
    }
  }, [id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: `new-${Date.now()}`,
      factoryId: id || '',
      factoryName: factory?.name || '',
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Update time since reply when user sends a message
    setTimeSinceReply(0);
  };
  
  const handleWhatsApp = () => {
    alert('This would open WhatsApp with a pre-filled message to the Maryadha team');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <Text style={[Typography.h4, styles.title]}>{factory?.name || 'Chat'}</Text>
      </View>
      
      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} />
          )}
          contentContainerStyle={styles.messagesList}
        />
        
        {/* WhatsApp Fallback */}
        {timeSinceReply >= 10 && (
          <View style={styles.fallbackContainer}>
            <Text style={[Typography.bodySmall, styles.fallbackText]}>
              No response in {timeSinceReply} minutes? Talk to a real person.
            </Text>
            <CustomButton
              title="Talk on WhatsApp"
              variant="primary"
              size="small"
              style={styles.whatsappButton}
              onPress={handleWhatsApp}
            />
          </View>
        )}
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip color={Colors.neutral[500]} size={20} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${factory?.name}...`}
            placeholderTextColor={Colors.neutral[500]}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send 
              color={!inputText.trim() ? Colors.neutral[400] : 'white'} 
              size={20} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
  fallbackContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  fallbackText: {
    marginBottom: 8,
  },
  whatsappButton: {
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  attachButton: {
    marginRight: 8,
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary[500],
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
});