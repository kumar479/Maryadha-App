import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, CircleHelp as HelpCircle, ChevronRight, LogOut } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';

export default function RepSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      
      router.replace('/auth/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error logging out');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information',
      icon: <User size={24} color={Colors.primary[500]} />,
      route: '/rep/tabs/repSettings/profile',
    },
    {
      title: 'Notifications',
      description: 'Configure your notification preferences',
      icon: <Bell size={24} color={Colors.primary[500]} />,
      route: '/rep/tabs/repSettings/notifications',
    },
    {
      title: 'Security',
      description: 'Update password and security settings',
      icon: <Shield size={24} color={Colors.primary[500]} />,
      route: '/rep/tabs/repSettings/security',
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: <HelpCircle size={24} color={Colors.primary[500]} />,
      route: 'https://support.maryadha.com',
      external: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[Typography.h1, styles.title]}>Settings</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemIcon}>
                  {item.icon}
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[Typography.h4, styles.menuItemTitle]}>
                    {item.title}
                  </Text>
                  <Text style={[Typography.bodySmall, styles.menuItemDescription]}>
                    {item.description}
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.neutral[400]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionInfo}>
          <Text style={[Typography.caption, styles.versionText]}>
            Version 1.0.0
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>
            {loading ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  title: {
    marginBottom: 8,
  },
  menuSection: {
    marginTop: 16,
  },
  menuItem: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    marginBottom: 2,
  },
  menuItemDescription: {
    color: Colors.neutral[600],
  },
  versionInfo: {
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    color: Colors.neutral[500],
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.status.errorLight,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 8,
    backgroundColor: Colors.status.errorLight,
  },
  logoutText: {
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.status.error,
  },
});