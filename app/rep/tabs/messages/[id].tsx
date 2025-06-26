import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import GroupChat from '@/components/messages/GroupChat';

export default function RepChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="back-button">
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <Text style={[Typography.h4, styles.title]}>Chat</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {id && <GroupChat orderId={id} onError={setError} />}
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
});
