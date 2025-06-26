import { Tabs } from 'expo-router';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  FileText,
  Factory,
} from 'lucide-react-native';
import { View } from 'react-native';
import Colors from '@/constants/Colors';
import NotificationBadge from '@/components/shared/NotificationBadge';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TabLayout() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[500],
        tabBarStyle: {
          backgroundColor: Colors.neutral[50],
          borderTopColor: Colors.neutral[200],
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="samples"
        options={{
          title: 'Samples',
          tabBarIcon: ({ color, size }) => (
            <View>
              <FileText size={size} color={color} />
              <NotificationBadge userId={userId} size="small" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="factoryProfiles"
        options={{
          title: 'Factories',
          tabBarIcon: ({ color, size }) => (
            <Factory size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="repSettings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
