import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Factory } from '@/types';
import FactoryProfileForm from '@/components/factory/FactoryProfileForm';
import CustomButton from '@/components/shared/CustomButton';
import { supabase } from '@/lib/supabase';
import { getCurrentUserRepId } from '@/utils/user';

export default function NewFactoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: Partial<Factory>) => {
    setLoading(true);
    try {
      // Get the current user's rep_id
      const repId = await getCurrentUserRepId();
      if (!repId) {
        throw new Error('Unable to get rep ID. Please ensure you are logged in as a rep.');
      }

      // Add the rep_id to the factory data
      const factoryDataWithRepId = {
        ...data,
        rep_id: repId,
      };

      const { error } = await supabase.from('factories').insert(factoryDataWithRepId);
      if (error) throw error;
      router.replace('/rep/tabs/factoryProfiles');
    } catch (error) {
      console.error('Error creating factory:', error);
    }
    setLoading(false);
  };

  const handleBack = () => {
    router.replace('/rep/tabs/factoryProfiles');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomButton
          title="Back"
          variant="outline"
          size="small"
          onPress={handleBack}
        />
        <Text style={styles.title}>New Factory</Text>
        <View style={{ width: 70 }} />
      </View>
      <FactoryProfileForm
        onSubmit={handleSave}
        submitting={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
}); 