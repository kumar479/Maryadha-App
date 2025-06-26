import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { SampleStatusUpdate } from '@/types';

interface SampleTimelineProps {
  updates: SampleStatusUpdate[];
}

const STAGES: SampleStatusUpdate['status'][] = [
  'requested',
  'invoice_sent',
  'sample_paid',
  'in_production',
  'shipped',
  'delivered',
];

export default function SampleTimeline({ updates }: SampleTimelineProps) {
  const map = updates.reduce<Record<string, SampleStatusUpdate>>( (acc, u) => {
    acc[u.status] = u;
    return acc;
  }, {} );

  // If there are no real updates (only initial 'requested'), show a message
  const hasRealUpdates = updates.length > 1 || (updates.length === 1 && updates[0].status !== 'requested');

  return (
    <View style={styles.container}>
      {!hasRealUpdates && (
        <Text style={[Typography.caption, { color: Colors.neutral[600], marginBottom: 12 }]}>No status updates yet. The timeline will update as your sample progresses.</Text>
      )}
      {STAGES.map((stage) => {
        const update = map[stage];
        const completed = Boolean(update);
        return (
          <View key={stage} style={styles.row}>
            {completed ? (
              <CheckCircle size={20} color={Colors.status.success} />
            ) : (
              <Circle size={20} color={Colors.neutral[400]} />
            )}
            <View style={styles.info}>
              <Text style={[Typography.body, styles.stageText]}>
                {stage.replace('_', ' ')}
              </Text>
              {update && (
                <Text style={[Typography.caption, styles.dateText]}>
                  {new Date(update.createdAt).toLocaleDateString()}
                </Text>
              )}
              {update?.eta && (
                <Text style={[Typography.caption, styles.dateText]}>
                  ETA: {new Date(update.eta).toLocaleDateString()}
                </Text>
              )}
              {update?.trackingNumber && (
                <Text style={[Typography.caption, styles.noteText]}>
                  Tracking: {update.trackingNumber}
                </Text>
              )}
              {update?.notes && (
                <Text style={[Typography.caption, styles.noteText]}>
                  {update.notes}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    marginLeft: 8,
  },
  stageText: {
    textTransform: 'capitalize',
  },
  dateText: {
    color: Colors.neutral[600],
  },
  noteText: {
    color: Colors.neutral[700],
  },
});
