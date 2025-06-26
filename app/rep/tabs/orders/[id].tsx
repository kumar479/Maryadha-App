import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { OrderStatusUpdate } from '@/types';

export default function RepOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('confirmed');
  const [delivery, setDelivery] = useState('');
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<OrderStatusUpdate[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data, error: orderError } = await supabase
        .from('orders')
        .select(`*, brands (name), factories (name)`) 
        .eq('id', id)
        .single();
      if (orderError) throw orderError;
      setOrder(data);
      setStatus(data.status);
      if (data.delivery_date) setDelivery(data.delivery_date.split('T')[0]);
      setNote(data.notes || '');
      const { data: hist } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
      setHistory(hist || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status,
          delivery_date: delivery ? new Date(delivery).toISOString() : null,
          notes: note || null,
        })
        .eq('id', id);
      if (updateErr) throw updateErr;

      await supabase.from('order_status_history').insert({
        order_id: id,
        status,
        notes: note || null,
      });

      setHistory((prev) => [
        ...prev,
        {
          orderId: id as string,
          status: status as any,
          notes: note || null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setOrder({
        ...order,
        status,
        delivery_date: delivery ? new Date(delivery).toISOString() : null,
        notes: note || null,
      });
      setNote('');
    } catch (err) {
      console.error('Update error', err);
      setError(err instanceof Error ? err.message : 'Error updating order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <CustomButton title="Go Back" onPress={() => router.back()} variant="outline" size="small" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomButton
          title="Back"
          variant="outline"
          size="small"
          icon={<ArrowLeft size={20} color={Colors.primary[500]} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={[Typography.h2, styles.title]}>Order Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={[Typography.h4]}>Status</Text>
            <Badge label={order.status.replace('_', ' ').toUpperCase()} variant="status" status={order.status} />
          </View>
          <OrderTimeline updates={history} />
          <Picker selectedValue={status} onValueChange={(val) => setStatus(val)} style={styles.picker}>
            <Picker.Item label="Confirmed" value="confirmed" />
            <Picker.Item label="In Production" value="in_production" />
            <Picker.Item label="Quality Check" value="quality_check" />
            <Picker.Item label="Completed" value="completed" />
          </Picker>
          <TextInput
            style={styles.input}
            value={delivery}
            onChangeText={setDelivery}
            placeholder="Estimated Delivery (YYYY-MM-DD)"
          />
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add note (optional)"
            multiline
          />
          <CustomButton title="Update Order" onPress={handleUpdate} loading={submitting} />
        </View>

        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Brand:</Text>
            <Text style={[Typography.body, styles.value]}>{order.brands?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
            <Text style={[Typography.body, styles.value]}>{order.factories?.name}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: Colors.status.error, marginBottom: 16, textAlign: 'center' },
  header: { padding: 16, paddingTop: 60, backgroundColor: Colors.neutral[50] },
  backButton: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { marginBottom: 16 },
  content: { flex: 1 },
  section: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  picker: { marginVertical: 8 },
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  detailRow: { flexDirection: 'row', marginBottom: 12 },
  label: { width: 120, color: Colors.neutral[700] },
  value: { flex: 1 },
});
