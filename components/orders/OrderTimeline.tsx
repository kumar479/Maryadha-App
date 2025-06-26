import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { OrderStatusUpdate } from '@/types';

interface OrderTimelineProps {
  updates: OrderStatusUpdate[];
}

const STAGES: OrderStatusUpdate['status'][] = [
  'confirmed',
  'in_production',
  'quality_check',
  'completed',
];

export default function OrderTimeline({ updates }: OrderTimelineProps) {
  const map = updates.reduce<Record<string, OrderStatusUpdate>>((acc, u) => {
    acc[u.status] = u;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
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
