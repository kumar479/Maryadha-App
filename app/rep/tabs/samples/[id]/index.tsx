import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FileText, Upload, MessageSquare } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import SampleTimeline from '@/components/samples/SampleTimeline';
import { SampleStatusUpdate } from '@/types';

export default function RepSampleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>('requested');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [eta, setEta] = useState('');
  const [tracking, setTracking] = useState('');
  const [history, setHistory] = useState<SampleStatusUpdate[]>([]);

  useEffect(() => {
    loadSampleDetails();
  }, [id]);

  useEffect(() => {
    if (sample?.status) {
      setStatus(sample.status);
    }
  }, [sample?.status]);

  const loadSampleDetails = async () => {
    try {
      const { data, error: sampleError } = await supabase
        .from('samples')
        .select(`*, brands (name, id), factories (name)`)
        .eq('id', id)
        .single();

      if (sampleError) throw sampleError;
      setSample(data);
      setStatus(data.status);

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
      setError(
        err instanceof Error ? err.message : 'Error loading sample details',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSubmitting(true);
      const { error: updateError } = await supabase
        .from('samples')
        .update({ status })
        .eq('id', id);
      if (updateError) throw updateError;

      // Ensure eta is in YYYY-MM-DD format or undefined
      let etaValue: string | undefined = eta;
      if (etaValue) {
        // Accept only YYYY-MM-DD, trim if user enters more
        etaValue = etaValue.split('T')[0];
        // Optionally validate with regex
        if (!/^\d{4}-\d{2}-\d{2}$/.test(etaValue)) {
          setError('ETA must be in YYYY-MM-DD format');
          setSubmitting(false);
          return;
        }
      } else {
        etaValue = undefined;
      }

      const insertObj = {
        sample_id: id,
        status,
        notes: note || null,
        eta: etaValue,
        tracking_number: tracking || null,
      };
      console.log('Inserting into sample_status_history:', insertObj);

      const { error: insertError } = await supabase
        .from('sample_status_history')
        .insert(insertObj);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      // Reload sample details and history from the database
      await loadSampleDetails();
      setNote('');
      setEta('');
      setTracking('');
    } catch (err) {
      console.error('Status update error', err);
      setError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoicePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      if (result.canceled || !result.assets) return;

      const file = result.assets[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `${id}/${fileName}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('sample-invoices')
        .upload(filePath, blob, { contentType: file.mimeType });

      if (uploadError) throw uploadError;

      setInvoice(result);
    } catch (err) {
      console.error('Invoice upload error', err);
      setError('Error uploading invoice');
    }
  };

  const handleSendInvoice = async () => {
    try {
      if (!id) {
        setError('Sample ID is missing.');
        return;
      }
      if (!sample || !sample.brand_id) {
        setError('Brand information is missing.');
        return;
      }
      if (!invoice || !amount || !dueDate) {
        setError('Please upload an invoice, amount, and due date');
        return;
      }
      // Validate amount is a positive number
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      // Validate due date is in the future
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime()) || parsedDueDate < new Date()) {
        setError('Please enter a valid future due date');
        return;
      }
      setSubmitting(true);
      setError(null);
      // Log the request body for debugging
      console.log('Sending invoice with:', {
        sampleId: id,
        amount: parsedAmount,
        dueDate: dueDate,
        customerId: sample.brand_id,
        currency: 'USD',
        paymentType: 'deposit',
      });
      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke('create-sample-payment', {
          body: {
            sampleId: id,
            amount: parsedAmount,
            dueDate: dueDate,
            customerId: sample.brand_id,
            currency: 'USD',
            paymentType: 'deposit',
          },
        });
      if (paymentError) throw paymentError;
      if (!paymentData?.clientSecret) {
        throw new Error('No client secret received');
      }
      const { error: updateError } = await supabase
        .from('samples')
        .update({
          invoice_url: (invoice as any).url,
          payment_client_secret: paymentData.clientSecret,
          status: 'invoice_sent'
        })
        .eq('id', id);
      if (updateError) throw updateError;
      // Add status history
      await supabase.from('sample_status_history').insert({
        sample_id: id,
        status: 'invoice_sent',
        note: `Invoice sent for ${parsedAmount} USD, due on ${dueDate}`
      });
      // Send notification message
      await supabase.from('messages').insert({
        sender_id: sample.rep_id,
        receiver_id: sample.brand_id,
        text: `Sample invoice uploaded for ${parsedAmount} USD, due on ${dueDate}`,
        attachments: [(invoice as any).url],
        type: 'invoice'
      });
      // Show success message
      alert('Invoice sent successfully');
      router.back();
    } catch (err) {
      console.error('Send invoice error', err);
      setError(err instanceof Error ? err.message : 'Error sending invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFile = (url: string) => {
    console.log('Opening file:', url);
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
        <CustomButton
          title="Back"
          variant="outline"
          size="small"
          icon={<ArrowLeft color={Colors.primary[500]} size={20} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={[Typography.h2, styles.title]}>Sample Details</Text>
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
            <SampleTimeline updates={history} />
          </View>
          {sample.status !== 'delivered' && (
            <>
              <Picker
                selectedValue={status}
                onValueChange={(val) => setStatus(val)}
                style={styles.picker}
              >
                <Picker.Item label="Requested" value="requested" />
                <Picker.Item label="Invoice Sent" value="invoice_sent" />
                <Picker.Item label="Sample Paid" value="sample_paid" />
                <Picker.Item label="In Production" value="in_production" />
                <Picker.Item label="Shipped" value="shipped" />
                <Picker.Item label="Delivered" value="delivered" />
              </Picker>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add note (optional)"
              />
              <TextInput
                style={styles.noteInput}
                value={eta}
                onChangeText={setEta}
                placeholder="ETA (YYYY-MM-DD)"
              />
              <TextInput
                style={styles.noteInput}
                value={tracking}
                onChangeText={setTracking}
                placeholder="Tracking Number"
              />
              <CustomButton
                title="Update Status"
                onPress={handleStatusUpdate}
                loading={submitting}
              />
            </>
          )}
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Brand:</Text>
            <Text style={[Typography.body, styles.value]}>
              {sample.brands?.name}
            </Text>
          </View>
          <View style={styles.chatButtonRow}>
            <CustomButton
              title="Chat"
              variant="outline"
              size="small"
              icon={<MessageSquare color={Colors.primary[500]} size={18} />}
              onPress={() => router.push(`/rep/tabs/samples/${id}/chat` as any)}
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
            <Text style={[Typography.body, styles.value]}>
              {sample.factories?.name}
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
        </View>
        <View style={styles.section}>
          <Text style={[Typography.h4, styles.sectionTitle]}>Files</Text>
          {sample.tech_pack_url && (
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => handleViewFile(sample.tech_pack_url)}
            >
              <FileText color={Colors.primary[500]} size={20} />
              <Text style={[Typography.body, styles.fileName]}>Tech Pack</Text>
            </TouchableOpacity>
          )}
          {sample.sketch_url && (
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => handleViewFile(sample.sketch_url)}
            >
              <FileText color={Colors.primary[500]} size={20} />
              <Text style={styles.fileName}>Sketch</Text>
            </TouchableOpacity>
          )}
          {sample.reference_images && sample.reference_images.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {sample.reference_images.map((img: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.fileButton}
                  onPress={() => handleViewFile(img)}
                >
                  <FileText color={Colors.primary[500]} size={20} />
                  <Text style={styles.fileName}>Reference {idx + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.section}>
          <Text style={[Typography.h4, styles.sectionTitle]}>Send Invoice</Text>
          {invoice && invoice.assets && (
            <View style={styles.invoiceInfo}>
              <FileText color={Colors.primary[500]} size={20} />
              <Text style={styles.fileName}>{invoice.assets[0].name}</Text>
            </View>
          )}
          {!invoice && (
            <TouchableOpacity
              style={styles.invoicePicker}
              onPress={handleInvoicePick}
            >
              <Upload color={Colors.primary[500]} size={20} />
              <Text style={styles.fileName}>Select Invoice (PDF)</Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="Invoice Amount"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.amountInput}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Due Date (YYYY-MM-DD)"
          />
          <CustomButton
            title="Send Invoice"
            onPress={handleSendInvoice}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 12 },
  label: { width: 120, color: Colors.neutral[700] },
  value: { flex: 1 },
  fileButton: {
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
  invoicePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  invoiceInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  amountInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  chatButtonRow: { marginBottom: 12, alignItems: 'flex-start' },
  picker: { marginVertical: 8 },
});
