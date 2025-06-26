import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import { getStripeHooks } from '@/lib/stripe';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import SampleTimeline from '@/components/samples/SampleTimeline';
import { SampleStatusUpdate } from '@/types';

export default function SampleDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params?.id?.toString() || '';
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = getStripeHooks();
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [history, setHistory] = useState<SampleStatusUpdate[]>([]);

  useEffect(() => {
    loadSampleDetails();
    const channel = supabase
      .channel(`sample-detail-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sample_status_history', filter: `sample_id=eq.${id}` },
        () => loadSampleDetails(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'samples', filter: `id=eq.${id}` },
        () => loadSampleDetails(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const loadSampleDetails = async () => {
    try {
      // Fetch the sample row only
      const { data, error: sampleError, status } = await supabase
        .from('samples')
        .select('*')
        .eq('id', id)
        .single();

      if (sampleError) {
        console.error('Sample fetch error:', sampleError, 'Status:', status);
        if (status === 406) {
          setError('Sample not found.');
        } else if (status === 400) {
          setError('Invalid sample ID or request.');
        } else {
          setError(sampleError.message || 'Error loading sample details');
        }
        setSample(null);
        return;
      }
      if (!data) {
        setError('Sample not found.');
        setSample(null);
        return;
      }

      // Fetch related factory and rep info if needed
      let factory = null;
      let rep = null;
      if (data?.factory_id) {
        const { data: factoryData } = await supabase
          .from('factories')
          .select('name')
          .eq('id', data.factory_id)
          .single();
        factory = factoryData;
      }
      if (data?.rep_id) {
        const { data: repData } = await supabase
          .from('reps')
          .select('name, email')
          .eq('id', data.rep_id)
          .single();
        rep = repData;
      }

      setSample({ ...data, factories: factory, reps: rep });

      // Load invoice if applicable
      const { data: invoiceData } = await supabase
        .from('sample_payments')
        .select('*')
        .eq('sample_id', id)
        .eq('payment_type', 'deposit')
        .single();
      if (invoiceData) setInvoice(invoiceData);

      const { data: historyData } = await supabase
        .from('sample_status_history')
        .select('*')
        .eq('sample_id', id)
        .order('created_at', { ascending: true });
      const initial: SampleStatusUpdate = {
        sampleId: id as string,
        status: 'requested',
        createdAt: data.created_at,
        notes: data.comments || null,
        eta: null,
        trackingNumber: null,
      };

      // Map database fields to SampleStatusUpdate interface
      const mappedHistory = (historyData || []).map((item: any) => ({
        id: item.id,
        sampleId: item.sample_id,
        status: item.status as SampleStatusUpdate['status'],
        notes: item.notes,
        eta: item.eta,
        trackingNumber: item.tracking_number,
        createdAt: item.created_at,
      }));

      setHistory([initial, ...mappedHistory]);
    } catch (err) {
      console.error('Sample details load error:', err);
      setError(err instanceof Error ? err.message : 'Error loading sample details');
      setSample(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (url: string) => {
    // In a real app, this would open the file in a viewer
    console.log('Opening file:', url);
  };

  const handleChatPress = () => {
    if (id) {
      router.push(`/brand/tabs/samples/${id}/chat` as any);
    }
  };

  const handlePay = async () => {
    if (!sample?.payment_client_secret || !invoice) return;
    try {
      setProcessingPayment(true);
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: sample.payment_client_secret,
      });
      if (initError) throw initError;
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw presentError;

      await supabase.from('samples').update({ status: 'sample_paid' }).eq('id', id);
      await supabase.from('sample_status_history').insert({
        sample_id: id,
        status: 'sample_paid',
      });
      await supabase
        .from('sample_payments')
        .update({ status: 'paid' })
        .eq('id', invoice.id);
      loadSampleDetails();
    } catch (err) {
      console.error('Payment error', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!sample) return;
    try {
      setCreatingOrder(true);
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          sample_id: sample.id,
          brand_id: sample.brand_id,
          factory_id: sample.factory_id,
          rep_id: sample.rep_id,
          quantity: sample.preferred_moq || 1,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      router.replace(`/brand/tabs/orders/${order.id}`);
    } catch (err) {
      console.error('Order creation error', err);
      setError(err instanceof Error ? err.message : 'Error creating order');
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading sample details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sample) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Sample not found'}</Text>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            size="small"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.title]}>Sample Details</Text>
        {sample && (
          <TouchableOpacity onPress={handleChatPress} style={styles.chatButton}>
            <MessageSquare size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
        <View style={styles.statusHeader}>
          <Text style={[Typography.h4]}>Status</Text>
          <Badge
            label={sample.status.replace('_', ' ').toUpperCase()}
            variant="status"
            status={sample.status}
          />
        </View>
        <SampleTimeline updates={history} />

          <View style={styles.detailRow}>
          <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
          <Text style={[Typography.body, styles.value]}>
            {sample.factories.name}
          </Text>
        </View>

        {sample.product_name && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Product:</Text>
            <Text style={[Typography.body, styles.value]}>
              {sample.product_name}
            </Text>
          </View>
        )}

          {sample.preferred_moq && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>
                Preferred MOQ:
              </Text>
              <Text style={[Typography.body, styles.value]}>
                {sample.preferred_moq} units
              </Text>
            </View>
          )}

          {sample.quantity && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>
                Quantity:
              </Text>
              <Text style={[Typography.body, styles.value]}>
                {sample.quantity} units
              </Text>
            </View>
          )}

          {sample.finish_notes && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>
                Finish / Color:
              </Text>
              <Text style={[Typography.body, styles.value]}>
                {sample.finish_notes}
              </Text>
            </View>
          )}

          {sample.delivery_address && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>
                Delivery Address:
              </Text>
              <Text style={[Typography.body, styles.value]}>
                {sample.delivery_address}
              </Text>
            </View>
          )}

          {sample.notes && (
            <View style={styles.notes}>
              <Text style={[Typography.bodySmall, styles.label]}>Notes:</Text>
              <Text style={[Typography.body, styles.notesText]}>
                {sample.notes}
              </Text>
            </View>
          )}
        </View>

        {sample.status === 'invoice_sent' && invoice && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>Invoice</Text>
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>Amount:</Text>
              <Text style={[Typography.body, styles.value]}>
                {invoice.currency} {invoice.amount}
              </Text>
            </View>
            {invoice.due_date && (
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, styles.label]}>Due Date:</Text>
                <Text style={[Typography.body, styles.value]}>{invoice.due_date}</Text>
              </View>
            )}
            {Platform.OS === 'web' ? (
              <View style={{ padding: 16 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>
                  Payments are only available on the mobile app.
                </Text>
              </View>
            ) : (
              <CustomButton
                title="Pay Now"
                onPress={handlePay}
                loading={processingPayment}
              />
            )}
          </View>
        )}

        {sample.status === 'delivered' && (
          <View style={styles.section}>
            {/* Remove CustomButton with onPress={() => handlePay('final')} and any references to handlePay in the render */}
          </View>
        )}

        {sample.status === 'approved' && (
          <View style={styles.section}>
            <CustomButton
              title="Create Order"
              onPress={handleCreateOrder}
              loading={creatingOrder}
            />
          </View>
        )}

        {sample?.files?.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>Files</Text>
            {sample.files.map((file: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleViewFile(file)}
                style={styles.fileRow}
              >
                <FileText size={24} />
                <Text style={[Typography.body, styles.fileName]}>
                  File {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sample.reps && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>
              Sourcing Expert
            </Text>
            <View style={styles.repCard}>
              <View style={styles.repInfo}>
                <Text style={[Typography.body, styles.repName]}>
                  {sample.reps.name}
                </Text>
                <Text style={[Typography.bodySmall, styles.repEmail]}>
                  {sample.reps.email}
                </Text>
              </View>
              <CustomButton
                title="Chat"
                variant="outline"
                size="small"
                icon={<MessageSquare size={18} />}
                onPress={handleChatPress}
              />
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
    backgroundColor: Colors.neutral[100],
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutral[100],
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
  notes: {
    marginTop: 16,
  },
  notesText: {
    marginTop: 8,
    color: Colors.neutral[700],
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    marginLeft: 12,
    color: Colors.primary[500],
    fontFamily: 'Inter_500Medium',
  },
  repCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chatButton: {
    marginLeft: 16,
  },
});
