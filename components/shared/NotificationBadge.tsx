import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface NotificationBadgeProps {
  userId?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function NotificationBadge({ userId, size = 'medium' }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (err) {
        console.error('Error fetching unread notifications:', err);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (unreadCount === 0) return null;

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, fontSize: 10 };
      case 'large':
        return { width: 24, height: 24, fontSize: 14 };
      default:
        return { width: 20, height: 20, fontSize: 12 };
    }
  };

  const badgeSize = getBadgeSize();

  return (
    <View style={[styles.badge, { width: badgeSize.width, height: badgeSize.height }]}>
      <Text style={[styles.text, { fontSize: badgeSize.fontSize }]}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.status.error,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    minHeight: 20,
  },
  text: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
}); 