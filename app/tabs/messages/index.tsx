import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import MessageCard from '@/components/messages/MessageCard';
import { chatsData } from '@/data/messagesData';

export default function MessagesScreen() {
  const router = useRouter();
  
  const handleChatPress = (factoryId: string) => {
    router.push(`/messages/${factoryId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Messages</Text>
      </View>
      
      {chatsData.length > 0 ? (
        <FlatList
          data={chatsData}
          keyExtractor={(item) => item.factoryId}
          renderItem={({ item }) => (
            <MessageCard chat={item} onPress={handleChatPress} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={Typography.body}>No messages yet</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
  },
  title: {
    marginBottom: 16,
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
});