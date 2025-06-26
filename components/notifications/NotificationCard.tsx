import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Database } from '@/types/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onMarkAsRead: () => void;
}

export default function NotificationCard({ notification, onPress, onMarkAsRead }: NotificationCardProps) {
  const formattedDate = new Date(notification.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Bell size={24} color={Colors.primary[500]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      {!notification.read && (
        <TouchableOpacity
          style={styles.readButton}
          onPress={onMarkAsRead}
        >
          <Text style={styles.readButtonText}>Mark as Read</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    marginBottom: 8,
  },
  unread: {
    backgroundColor: Colors.primary[100],
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  message: {
    ...Typography.body,
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  date: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  readButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  readButtonText: {
    ...Typography.caption,
    color: 'white',
  },
}); 