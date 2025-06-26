import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileCheck, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Badge from '@/components/shared/Badge';
import { Sample } from '@/types';

interface SampleCardProps {
  sample: Sample;
  onPress: () => void;
}

export default function SampleCard({ sample, onPress }: SampleCardProps) {
  const formattedDate = new Date(sample.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[Typography.h5, styles.brandName]}>
          {sample.brands.name}
        </Text>
        <Badge 
          label={sample.status.replace('_', ' ').toUpperCase()} 
          variant="status"
          status={sample.status}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <FileCheck size={16} color={Colors.neutral[700]} />
          <Text style={[Typography.bodySmall, styles.detailText]}>
            For {sample.factories.name}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.neutral[700]} />
          <Text style={[Typography.bodySmall, styles.detailText]}>
            Requested on {formattedDate}
          </Text>
        </View>

        {sample.preferredMoq && (
          <Text style={[Typography.bodySmall, styles.moqText]}>
            Preferred MOQ: {sample.preferredMoq} units
          </Text>
        )}
      </View>

      <Text style={[Typography.caption, styles.actionText]}>
        Tap to review details
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    flex: 1,
    marginRight: 8,
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.neutral[700],
  },
  moqText: {
    color: Colors.neutral[700],
  },
  actionText: {
    color: Colors.primary[500],
    textAlign: 'right',
  },
});