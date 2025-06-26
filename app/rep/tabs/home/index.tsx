import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, FileCheck, MessageSquare, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';

export default function RepDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingSamples: 0,
    activeOrders: 0,
    unreadMessages: 0,
  });
  const [recentSamples, setRecentSamples] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get rep ID
      const { data: rep } = await supabase
        .from('reps')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!rep) throw new Error('Rep not found');

      // Load recent samples
      const { data: samples, error: samplesError } = await supabase
        .from('samples')
        .select(`
          *,
          brands (name),
          factories (name)
        `)
        .eq('rep_id', rep.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (samplesError) throw samplesError;

      // Load recent orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          brands (name),
          factories (name)
        `)
        .eq('rep_id', rep.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;

      // Get stats
      const pendingSamples = samples?.filter(s => s.status === 'requested').length || 0;
      const activeOrders = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status)).length || 0;

      // Get unread messages count
      const { count: unreadCount, error: messageError } = await supabase
        .from('message_notifications')
        .select('*', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (messageError) throw messageError;

      setStats({
        pendingSamples,
        activeOrders,
        unreadMessages: unreadCount || 0,
      });
      setRecentSamples(samples || []);
      setRecentOrders(orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[Typography.h4, styles.statValue]}>{value}</Text>
        <Text style={[Typography.bodySmall, styles.statTitle]}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.h1, styles.title]}>Rep Dashboard</Text>
          <Text style={[Typography.body, styles.subtitle]}>
            Manage your sourcing assignments
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton
              title="Retry"
              variant="outline"
              size="small"
              onPress={loadDashboardData}
              style={styles.retryButton}
            />
          </View>
        )}

        <View style={styles.statsContainer}>
          <StatCard
            icon={FileCheck}
            title="Pending Samples"
            value={stats.pendingSamples}
            color={Colors.primary[500]}
          />
          <StatCard
            icon={Package}
            title="Active Orders"
            value={stats.activeOrders}
            color={Colors.status.success}
          />
          <StatCard
            icon={MessageSquare}
            title="Unread Messages"
            value={stats.unreadMessages}
            color={Colors.status.info}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Recent Samples</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/rep/tabs/samples')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {recentSamples.map((sample) => (
            <TouchableOpacity
              key={sample.id}
              style={styles.itemCard}
              onPress={() => router.push(`/rep/tabs/samples/${sample.id}`)}
            >
              <View style={styles.itemHeader}>
                <Text style={[Typography.body, styles.itemTitle]}>
                  {sample.brands.name}
                </Text>
                <Badge
                  label={sample.status.replace('_', ' ').toUpperCase()}
                  variant="status"
                  status={sample.status}
                />
              </View>
              <Text style={[Typography.bodySmall, styles.itemSubtitle]}>
                For {sample.factories.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Recent Orders</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/rep/tabs/orders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.itemCard}
              onPress={() => router.push(`/rep/tabs/orders/${order.id}`)}
            >
              <View style={styles.itemHeader}>
                <Text style={[Typography.body, styles.itemTitle]}>
                  {order.brands.name}
                </Text>
                <Badge
                  label={order.status.replace('_', ' ').toUpperCase()}
                  variant="status"
                  status={order.status}
                />
              </View>
              <Text style={[Typography.bodySmall, styles.itemSubtitle]}>
                {order.quantity} units • {order.factories.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.neutral[600],
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.status.errorLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.status.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 28,
  },
  statTitle: {
    color: Colors.neutral[600],
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: Colors.primary[500],
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    marginRight: 8,
  },
  itemSubtitle: {
    color: Colors.neutral[600],
  },
});