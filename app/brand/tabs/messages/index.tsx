import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import MessageCard from '@/components/messages/MessageCard';

export default function MessagesScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's chats
      const { data: chatData, error: chatError } = await supabase
        .from('group_chats')
        .select(`
          *,
          factories (name),
          messages (
            id,
            text,
            created_at,
            sender_id
          )
        `)
        .eq('brand_id', user.id)
        .order('updated_at', { ascending: false });

      if (chatError) throw chatError;

      // Get unread notifications grouped by chat
      const { data: notifications, error: notifError } = await supabase
        .from('message_notifications')
        .select('id, messages!inner(chat_id)')
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (notifError) throw notifError;

      const unreadMap: Record<string, number> = {};
      notifications?.forEach((n: any) => {
        const chatId = n.messages?.chat_id;
        if (chatId) {
          unreadMap[chatId] = (unreadMap[chatId] || 0) + 1;
        }
      });

      // Format chats with last message and unread count
      const formattedChats = chatData?.map(chat => ({
        id: chat.id,
        factoryName: chat.factories?.name || 'Unknown Factory',
        lastMessage: chat.messages?.[0]?.text || 'No messages yet',
        timestamp: chat.messages?.[0]?.created_at || chat.created_at,
        unread: unreadMap[chat.id] || 0,
      })) || [];

      setChats(formattedChats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (chatId: string) => {
    router.push(`/brand/tabs/messages/${chatId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Messages</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageCard chat={item} onPress={() => handleChatPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[Typography.body, styles.emptyText]}>
              No messages yet. Start a conversation from a factory or order page.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
  },
  title: {
    marginBottom: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.status.errorLight,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});