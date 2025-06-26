import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Order } from '@/types';
import CustomButton from '@/components/shared/CustomButton';
import OrderCard from '@/components/orders/OrderCard';

// Temporary mock data - replace with Supabase data
const mockOrders: Order[] = [
  {
    id: '1',
    sampleId: 'sample1',
    brandId: 'brand1',
    factoryId: 'factory1',
    status: 'in_production',
    quantity: 100,
    unitPrice: 45.99,
    totalAmount: 4599,
    currency: 'USD',
    paymentStatus: 'partial',
    estimatedDelivery: '2025-07-15',
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
  },
  {
    id: '2',
    sampleId: 'sample2',
    brandId: 'brand1',
    factoryId: 'factory2',
    status: 'confirmed',
    quantity: 50,
    unitPrice: 89.99,
    totalAmount: 4499.50,
    currency: 'USD',
    paymentStatus: 'pending',
    estimatedDelivery: '2025-08-01',
    createdAt: '2025-04-28T14:30:00Z',
    updatedAt: '2025-04-28T14:30:00Z',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [orders] = useState<Order[]>(mockOrders);
  
  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Orders</Text>
        <CustomButton
          title="Create Order"
          variant="primary"
          size="small"
          onPress={() => alert('Create order flow will be implemented')}
        />
      </View>
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => handleOrderPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={Typography.body}>No orders yet</Text>
          <Text style={[Typography.bodySmall, styles.emptyText]}>
            Start by requesting samples from factories
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Colors.neutral[500],
    marginTop: 8,
  },
});