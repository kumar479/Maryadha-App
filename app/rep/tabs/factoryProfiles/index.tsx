import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import { Factory } from '@/types';
import FactoryCard from '@/components/factory/FactoryCard';
import CustomButton from '@/components/shared/CustomButton';

export default function RepFactoriesScreen() {
  const router = useRouter();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFactories();
  }, []);

  const loadFactories = async () => {
    const { data, error } = await supabase
      .from('factories')
      .select('*')
      .order('name');
    if (!error) setFactories(data || []);
    setLoading(false);
  };

  const handleFactoryPress = (factoryId: string) => {
    console.log('Navigating to factory details:', factoryId);
    router.replace(`/rep/tabs/factoryProfiles/${factoryId}`);
  };

  const handleAddPress = () => {
    router.replace('/rep/tabs/factoryProfiles/new');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Factories</Text>
        <CustomButton
          title="Add"
          size="small"
          onPress={handleAddPress}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {factories.map((factory) => (
          <FactoryCard
            key={factory.id}
            factory={factory}
            onPress={handleFactoryPress}
          />
        ))}
        {factories.length === 0 && !loading && (
          <Text style={styles.empty}>No factories yet</Text>
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
  header: {
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    ...Typography.body,
  },
});
