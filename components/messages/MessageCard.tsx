import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Chat } from '@/types';

interface MessageCardProps {
  chat: Chat;
  onPress: (factoryId: string) => void;
}

export default function MessageCard({ chat, onPress }: MessageCardProps) {
  // Format timestamp to show either today's time or date
  const formatTimestamp = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      // Today, show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Not today, show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(chat.factoryId)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[Typography.h5, styles.name]}>{chat.factoryName}</Text>
          <Text style={[Typography.caption, styles.time]}>
            {formatTimestamp(chat.timestamp)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[Typography.body, styles.message]}
            numberOfLines={2}
          >
            {chat.lastMessage}
          </Text>
          
          {chat.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
  },
  time: {
    color: Colors.neutral[500],
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    color: Colors.neutral[700],
  },
  badge: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    paddingHorizontal: 6,
  },
});