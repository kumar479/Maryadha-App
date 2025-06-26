import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Badge from '@/components/shared/Badge';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={[Typography.h3, styles.orderId]}>Order #{order.id.slice(0, 8)}</Text>
        <Badge 
          label={order.status.replace('_', ' ').toUpperCase()}
          variant="status"
          status={order.status}
        />
      </View>
      
      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
          <Text style={Typography.body}>{order.factories?.name || 'Not assigned'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[Typography.bodySmall, styles.label]}>Quantity:</Text>
          <Text style={Typography.body}>{order.quantity} units</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[Typography.bodySmall, styles.label]}>Total Amount:</Text>
          <Text style={Typography.body}>
            {order.currency} {order.totalAmount?.toFixed(2)}
          </Text>
        </View>
        
        {order.estimatedDelivery && (
          <View style={styles.row}>
            <Text style={[Typography.bodySmall, styles.label]}>Est. Delivery:</Text>
            <Text style={Typography.body}>
              {formatDate(order.estimatedDelivery)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Badge 
          label={`Payment: ${order.paymentStatus}`}
          variant="status"
          status={order.paymentStatus === 'paid' ? 'approved' : 'pending'}
        />
        <Text style={[Typography.bodySmall, styles.date]}>
          Created: {formatDate(order.createdAt)}
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
    marginBottom: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    flex: 1,
    marginRight: 8,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.neutral[500],
    width: 100,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  date: {
    color: Colors.neutral[500],
  },
});