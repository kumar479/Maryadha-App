import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import FactoryProfileForm from '@/components/factory/FactoryProfileForm';
import { Factory } from '@/types';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import CustomButton from '@/components/shared/CustomButton';

export default function FactoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadFactory();
    }
  }, [id]);

  const loadFactory = async () => {
    setLoading(true);
    console.log('Loading factory with ID:', id);
    
    const { data, error } = await supabase
      .from('factories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading factory:', error);
      // Don't redirect immediately, let the UI show the error
      setLoading(false);
      return;
    }

    if (!data) {
      console.error('Factory not found for ID:', id);
      setLoading(false);
      return;
    }

    console.log('Factory loaded successfully:', data.name);
    setFactory(data as Factory);
    setLoading(false);
  };

  const handleSave = async (data: Partial<Factory>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('factories').update(data).eq('id', id);
      if (error) throw error;
      await loadFactory();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving factory:', error);
    }
    setLoading(false);
  };

  const handleBack = () => {
    router.replace('/rep/tabs/factoryProfiles');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <CustomButton
            title="Back"
            variant="outline"
            size="small"
            onPress={handleBack}
          />
          <Text style={styles.title}>Edit Factory</Text>
          <View style={{ width: 70 }} />
        </View>
        <FactoryProfileForm
          initialData={factory ?? undefined}
          onSubmit={handleSave}
          submitting={loading}
        />
      </SafeAreaView>
    );
  }

  if (!factory) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Factory not found</Text>
        <CustomButton
          title="Go Back"
          onPress={handleBack}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <CustomButton
            title="Back"
            variant="outline"
            size="small"
            onPress={handleBack}
          />
          <Text style={styles.title}>{factory.name}</Text>
          <CustomButton
            title="Edit"
            size="small"
            onPress={() => setIsEditing(true)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{factory.location}</Text>
        </View>

        {factory.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{factory.description}</Text>
          </View>
        )}

        {factory.founder_story && (
          <View style={styles.section}>
            <Text style={styles.label}>Founder Story</Text>
            <Text style={styles.value}>{factory.founder_story}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Product Categories</Text>
          <Text style={styles.value}>
            {factory.product_categories?.join(', ') || 'None specified'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Minimum Order Quantity</Text>
          <Text style={styles.value}>
            {factory.minimum_order_quantity || 'Not specified'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Leather Types</Text>
          <Text style={styles.value}>{factory.leather_types.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tanning Types</Text>
          <Text style={styles.value}>{factory.tanning_types.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Finishes</Text>
          <Text style={styles.value}>{factory.finishes.join(', ')}</Text>
        </View>

        {factory.delivery_timeline && (
          <View style={styles.section}>
            <Text style={styles.label}>Delivery Timeline</Text>
            <Text style={styles.value}>{factory.delivery_timeline}</Text>
          </View>
        )}

        {factory.certifications && factory.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Certifications</Text>
            <Text style={styles.value}>{factory.certifications.join(', ')}</Text>
          </View>
        )}

        {factory.tech_pack_guide && (
          <View style={styles.section}>
            <Text style={styles.label}>Tech Pack Guide</Text>
            <TouchableOpacity
              onPress={() => {
                // Open tech pack guide in new tab/window
                if (typeof window !== 'undefined') {
                  window.open(factory.tech_pack_guide, '_blank');
                }
              }}
            >
              <Text style={styles.link}>View Tech Pack Guide</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    ...Typography.h1,
    color: Colors.neutral[900],
  },
  section: {
    marginBottom: 20,
  },
  label: {
    ...Typography.label,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  value: {
    ...Typography.body,
    color: Colors.neutral[900],
  },
  link: {
    ...Typography.body,
    color: Colors.primary[600],
    textDecorationLine: 'underline',
  },
  loadingText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    ...Typography.body,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});
