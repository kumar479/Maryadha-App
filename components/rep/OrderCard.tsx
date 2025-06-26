import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[Typography.subtitle, styles.brandName]}>
            {order.brands?.name || 'Unknown Brand'}
          </Text>
          <Text style={[Typography.caption, styles.status]}>
            {order.status}
          </Text>
        </View>
        
        <View style={styles.details}>
          <Text style={[Typography.body, styles.factory]}>
            Factory: {order.factories?.name || 'Not assigned'}
          </Text>
          <Text style={[Typography.body, styles.quantity]}>
            Quantity: {order.quantity}
          </Text>
          <Text style={[Typography.caption, styles.date]}>
            Created: {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    color: Colors.neutral[900],
  },
  status: {
    backgroundColor: Colors.primary[100],
    color: Colors.primary[700],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  details: {
    gap: 4,
  },
  factory: {
    color: Colors.neutral[700],
  },
  quantity: {
    color: Colors.neutral[700],
  },
  date: {
    color: Colors.neutral[500],
    marginTop: 4,
  },
});