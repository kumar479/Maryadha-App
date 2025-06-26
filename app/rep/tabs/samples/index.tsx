import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import SampleCard from '@/components/samples/SampleCard';

export default function RepSamplesScreen() {
  const router = useRouter();
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repId, setRepId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [factoryFilter, setFactoryFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const getRep = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: rep } = await supabase
          .from('reps')
          .select('id')
          .eq('user_id', user.id)
          .single();
        setRepId(rep?.id || null);
      }
    };
    getRep();
  }, []);

  useEffect(() => {
    if (repId) {
      loadSamples();
      setupRealtimeSubscription();
    }
  }, [repId]);

  // Refresh samples when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (repId) {
        loadSamples();
      }
    }, [repId]),
  );

  const setupRealtimeSubscription = () => {
    if (!repId) return;

    const channel = supabase
      .channel('rep-samples-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'samples',
          filter: `rep_id=eq.${repId}`,
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

      const { data: rep } = await supabase
        .from('reps')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rep) throw new Error('Rep not found');

      const { data, error: samplesError } = await supabase
        .from('samples')
        .select(`*, brands (name), factories (name)`)
        .eq('rep_id', rep.id)
        .order('created_at', { ascending: false });

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
    router.push(`/rep/tabs/samples/${sampleId}`);
  };

  const filteredSamples = samples.filter((s) => {
    if (factoryFilter && s.factory_id !== factoryFilter) return false;
    if (brandFilter && s.brand_id !== brandFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    const searchLower = search.toLowerCase();
    if (
      searchLower &&
      !(
        (s.factories?.name || '').toLowerCase().includes(searchLower) ||
        (s.brands?.name || '').toLowerCase().includes(searchLower)
      )
    )
      return false;
    return true;
  });

  const factoryOptions = Array.from(
    new Map(
      samples.map((s) => [s.factory_id, s.factories?.name || 'Unknown Factory'])
    )
  );
  const brandOptions = Array.from(
    new Map(samples.map((s) => [s.brand_id, s.brands?.name || 'Unknown Brand']))
  );

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
        <Text style={[Typography.h1, styles.title]}>Samples</Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />
        <Picker
          selectedValue={factoryFilter || ''}
          onValueChange={(val) => setFactoryFilter(val || null)}
          style={styles.picker}
        >
          <Picker.Item label="All Factories" value="" />
          {factoryOptions.map(([id, name]) => (
            <Picker.Item key={id} label={name as string} value={id as string} />
          ))}
        </Picker>
        <Picker
          selectedValue={brandFilter || ''}
          onValueChange={(val) => setBrandFilter(val || null)}
          style={styles.picker}
        >
          <Picker.Item label="All Brands" value="" />
          {brandOptions.map(([id, name]) => (
            <Picker.Item key={id} label={name as string} value={id as string} />
          ))}
        </Picker>
        <Picker
          selectedValue={statusFilter || ''}
          onValueChange={(val) => setStatusFilter(val || null)}
          style={styles.picker}
        >
          <Picker.Item label="All Statuses" value="" />
          <Picker.Item label="Requested" value="requested" />
          <Picker.Item label="Invoice Sent" value="invoice_sent" />
          <Picker.Item label="Sample Paid" value="sample_paid" />
          <Picker.Item label="In Production" value="in_production" />
          <Picker.Item label="Shipped" value="shipped" />
          <Picker.Item label="Delivered" value="delivered" />
        </Picker>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredSamples}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SampleCard
            sample={{
              id: item.id,
              factoryId: item.factory_id,
              factoryName: item.factories?.name || 'Unknown Factory',
              status: item.status,
              createdAt: item.created_at,
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
              No sample requests yet
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    padding: 16,
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
  filters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 8,
  },
  picker: { marginVertical: 8 },
});
