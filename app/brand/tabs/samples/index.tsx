import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import SampleCard from '@/components/samples/SampleCard';
import BottomSheet from '@/components/shared/BottomSheet';
import SampleRequestForm from '@/components/samples/SampleRequestForm';

export default function SamplesScreen() {
  const router = useRouter();
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadSamples();
      setupRealtimeSubscription();
    }
  }, [userId]);

  // Refresh samples when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        loadSamples();
      }
    }, [userId]),
  );

  const setupRealtimeSubscription = () => {
    if (!userId) return;

    const channel = supabase
      .channel('samples-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'samples',
          filter: `brand_id=eq.${userId}`,
        },
        () => {
          // Refresh the samples list when any change occurs
          loadSamples();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadSamples = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use correct join syntax for Supabase
      let { data, error: samplesError } = await supabase
        .from('samples')
        .select(
          `
          *,
          factories:factory_id (name),
          reps:rep_id (name)
        `,
        )
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      // Fallback: If join fails, try without joins
      if (samplesError) {
        ({ data, error: samplesError } = await supabase
          .from('samples')
          .select('*')
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false }));
      }

      if (samplesError) throw samplesError;
      setSamples(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading samples');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSamples();
  };

  const handleSamplePress = (sampleId: string) => {
    router.push(`/brand/tabs/samples/${sampleId}`);
  };

  const handleRequestSample = (factoryId: string) => {
    setSelectedFactory(factoryId);
    setIsRequestModalVisible(true);
  };

  const handleSubmitRequest = async (formData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get factory details and check if it has a rep assigned
      const { data: factory } = await supabase
        .from('factories')
        .select('rep_id, name')
        .eq('id', selectedFactory)
        .single();

      if (!factory) throw new Error('Factory not found');

      // Handle rep assignment
      let repId = factory.rep_id;
      
      // If factory doesn't have a rep assigned, we need to assign one
      if (!repId) {
        // Get the first available rep (you might want to implement a more sophisticated assignment logic)
        const { data: availableRep } = await supabase
          .from('reps')
          .select('id')
          .eq('active', true)
          .limit(1)
          .single();
        
        if (availableRep) {
          repId = availableRep.id;
          
          // Update the factory with the assigned rep
          await supabase
            .from('factories')
            .update({ rep_id: repId })
            .eq('id', selectedFactory);
        } else {
          throw new Error('No available reps to assign to this factory');
        }
      }

      // Ensure repId is the correct format (reps.id, not user_id)
      if (repId) {
        const { data: repRow } = await supabase
          .from('reps')
          .select('id')
          .eq('id', repId)
          .single();
        
        if (!repRow) {
          // If repId is actually a user_id, get the rep's id
          const { data: repByUserId } = await supabase
            .from('reps')
            .select('id')
            .eq('user_id', repId)
            .single();
          
          if (repByUserId) {
            repId = repByUserId.id;
          } else {
            throw new Error('Invalid rep assignment');
          }
        }
      }

      // Create sample request with the correct schema
      const { data: sample, error: sampleError } = await supabase
        .from('samples')
        .insert({
          brand_id: user.id,
          factory_id: selectedFactory,
          rep_id: repId,
          status: 'requested',
          file_url: formData.techPack,
          comments: formData.notes,
          product_name: formData.productName,
          reference_images: formData.referenceImages,
          preferred_moq: formData.preferredMoq,
          quantity: formData.quantity,
          finish_notes: formData.finishNotes,
          delivery_address: formData.deliveryAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sampleError) throw sampleError;

      // Auto-create chat thread for this sample
      const { data: chat, error: chatError } = await supabase
        .from('group_chats')
        .insert({
          sample_id: sample.id,
          brand_id: user.id,
          factory_id: selectedFactory,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Get rep's user_id for chat participants
      const { data: repUser } = await supabase
        .from('reps')
        .select('user_id')
        .eq('id', repId)
        .single();

      if (repUser) {
        await supabase.from('chat_participants').insert([
          { chat_id: chat.id, user_id: user.id, role: 'brand' },
          { chat_id: chat.id, user_id: repUser.user_id, role: 'rep' },
        ]);
      }

      // Trigger notification to the sales rep
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sample-request-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ sampleId: sample.id }),
            },
          );
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the sample request if notification fails
      }

      // Refresh samples list
      loadSamples();
      setIsRequestModalVisible(false);
      setSelectedFactory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting request');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading samples...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Sample Requests</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={samples}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SampleCard
            sample={{
              id: item.id,
              factoryId: item.factory_id,
              factoryName: item.factories?.name || 'Unknown Factory',
              status: item.status,
              createdAt: item.created_at,
              productName: item.product_name,
              referenceImages: item.reference_images,
              preferredMoq: item.preferred_moq,
              quantity: item.quantity,
              finishNotes: item.finish_notes,
              deliveryAddress: item.delivery_address,
              notes: item.comments,
            }}
            onPress={() => handleSamplePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[Typography.body, styles.emptyText]}>
              No sample requests yet. Start by requesting samples from
              factories.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <BottomSheet
        isVisible={isRequestModalVisible}
        onClose={() => {
          setIsRequestModalVisible(false);
          setSelectedFactory(null);
        }}
        title="Request a Sample"
        height="90%"
      >
        <SampleRequestForm
          factoryId={selectedFactory || ''}
          onSubmit={handleSubmitRequest}
          onClose={() => setIsRequestModalVisible(false)}
        />
      </BottomSheet>
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
    padding: 16,
    paddingBottom: 40,
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
