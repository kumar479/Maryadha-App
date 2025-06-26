import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Clock,
  Truck as TruckIcon,
  FileCheck,
  CircleCheck as CheckCircle,
  Circle as XCircle,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Sample } from '@/types';
import Badge from '@/components/shared/Badge';

interface SampleCardProps {
  sample: Sample;
  onPress: (sample: Sample) => void;
}

export default function SampleCard({ sample, onPress }: SampleCardProps) {
  // Get the formatted date to display
  const formattedDate = new Date(sample.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Get the appropriate status icon
  const getStatusIcon = () => {
    const size = 18;
    const color = Colors.neutral[700];

    switch (sample.status) {
      case 'requested':
        return <Clock size={size} color={color} />;
      case 'shipped':
        return <TruckIcon size={size} color={color} />;
      case 'in_review':
        return <FileCheck size={size} color={color} />;
      case 'approved':
        return <CheckCircle size={size} color={Colors.status.success} />;
      case 'rejected':
        return <XCircle size={size} color={Colors.status.error} />;
      case 'invoice_sent':
        return <FileCheck size={size} color={color} />;
      case 'sample_paid':
        return <CheckCircle size={size} color={Colors.status.success} />;
      case 'in_production':
        return <TruckIcon size={size} color={color} />;
      case 'delivered':
        return <CheckCircle size={size} color={Colors.status.success} />;
      default:
        return <Clock size={size} color={color} />;
    }
  };

  const getStatusText = () => {
    switch (sample.status) {
      case 'requested':
        return 'Requested';
      case 'shipped':
        return 'Shipped';
      case 'in_review':
        return 'In Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'invoice_sent':
        return 'Invoice Sent';
      case 'sample_paid':
        return 'Sample Paid';
      case 'in_production':
        return 'In Production';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Requested';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(sample)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[Typography.h5, styles.factoryName]}>
          {sample.factoryName}
        </Text>
        <Badge
          label={getStatusText()}
          variant="status"
          status={sample.status}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>{getStatusIcon()}</View>
          <Text style={[Typography.bodySmall, styles.detailText]}>
            {getStatusText()} on {formattedDate}
          </Text>
        </View>

        {sample.productName && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.detailText]}>
              Product: {sample.productName}
            </Text>
          </View>
        )}

        {sample.preferredMoq && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.detailText]}>
              Preferred MOQ: {sample.preferredMoq} units
            </Text>
          </View>
        )}
        {sample.quantity && (
          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.detailText]}>
              Quantity: {sample.quantity} units
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[Typography.caption, styles.viewDetails]}>
          Tap to view details
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingBottom: 12,
  },
  factoryName: {
    flex: 1,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  detailText: {
    color: Colors.neutral[700],
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  viewDetails: {
    color: Colors.primary[500],
  },
});
