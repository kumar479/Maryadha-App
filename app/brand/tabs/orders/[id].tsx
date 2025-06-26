import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { OrderStatusUpdate } from '@/types';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<OrderStatusUpdate[]>([]);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const { data, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          factories (name),
          reps (name, email)
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      setOrder(data);

      const { data: historyData } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
      setHistory(historyData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
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
        <Badge
          label={order.status.replace('_', ' ').toUpperCase()}
          variant="status"
          status={order.status}
        />
      </View>
      <OrderTimeline updates={history} />

      <View style={styles.detailRow}>
        <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
        <Text style={[Typography.body, styles.value]}>{order.factories.name}</Text>
      </View>

          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Quantity:</Text>
            <Text style={[Typography.body, styles.value]}>{order.quantity} units</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Total Amount:</Text>
          <Text style={[Typography.body, styles.value]}>
            {order.currency} {order.total_amount.toFixed(2)}
          </Text>
        </View>

        {order.delivery_date && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Est. Delivery:</Text>
            <Text style={[Typography.body, styles.value]}>
              {new Date(order.delivery_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {order.notes && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Notes:</Text>
            <Text style={[Typography.body, styles.value]}>{order.notes}</Text>
          </View>
        )}

          {order.tracking_number && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>Tracking:</Text>
              <Text style={[Typography.body, styles.value]}>{order.tracking_number}</Text>
            </View>
          )}
        </View>

        {order.reps && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>Sourcing Expert</Text>
            <View style={styles.repCard}>
              <View style={styles.repInfo}>
                <Text style={[Typography.body, styles.repName]}>{order.reps.name}</Text>
                <Text style={[Typography.bodySmall, styles.repEmail]}>{order.reps.email}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 120,
    color: Colors.neutral[700],
  },
  value: {
    flex: 1,
  },
  repCard: {
    backgroundColor: Colors.neutral[100],
    padding: 16,
    borderRadius: 8,
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    marginBottom: 4,
  },
  repEmail: {
    color: Colors.neutral[600],
  },
});