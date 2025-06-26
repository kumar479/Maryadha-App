import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import FilterBar from '@/components/factory/FilterBar';
import FactoryCard from '@/components/factory/FactoryCard';
import { supabase } from '@/lib/supabase';
import { Factory } from '@/types';

export default function FactoriesScreen() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [filteredFactories, setFilteredFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFactories();
  }, []);

  const loadFactories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('factories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setFactories(data || []);
      setFilteredFactories(data || []);
    } catch (err) {
      console.error('Error loading factories:', err);
      setError(err instanceof Error ? err.message : 'Error loading factories');
    } finally {
      setLoading(false);
    }
  };

  // MOQ filter options
  const moqOptions = [
    { label: '<50', value: 'moq_lt_50' },
    { label: '50-100', value: 'moq_50_100' },
    { label: '100+', value: 'moq_gt_100' },
  ];

  // Leather type filter options
  const leatherOptions = [
    { label: 'CowHide', value: 'CowHide' },
    { label: 'LambSkin', value: 'LambSkin' },
    { label: 'GoatSkin', value: 'GoatSkin' },
  ];

  // Leather finish filter options
  const finishOptions = [
    { label: 'Distressed', value: 'Distressed' },
    { label: 'Polished', value: 'Polished' },
    { label: 'Matte', value: 'Matte' },
    { label: 'Pebbled', value: 'Pebbled' },
    { label: 'Suede', value: 'Suede' },
  ];

  // Tanning type filter options
  const tanningOptions = [
    { label: 'Chrome', value: 'Chrome' },
    { label: 'Vegetable', value: 'Vegetable' },
  ];

  const categoryOptions = [
    { label: 'Bags', value: 'Bags' },
    { label: 'Jackets', value: 'Jackets' },
    { label: 'Wallets', value: 'Wallets' },
    { label: 'Belts', value: 'Belts' },
  ];

  // Handle MOQ filter changes
  const handleMoqFilterChange = (selectedMoqs: string[]) => {
    if (selectedMoqs.length === 0) {
      setFilteredFactories(factories);
      return;
    }

    const filtered = factories.filter((factory) => {
      if (
        selectedMoqs.includes('moq_lt_50') &&
        factory.minimum_order_quantity < 50
      ) {
        return true;
      }
      if (
        selectedMoqs.includes('moq_50_100') &&
        factory.minimum_order_quantity >= 50 &&
        factory.minimum_order_quantity <= 100
      ) {
        return true;
      }
      if (
        selectedMoqs.includes('moq_gt_100') &&
        factory.minimum_order_quantity > 100
      ) {
        return true;
      }
      return false;
    });

    setFilteredFactories(filtered);
  };

  // Handle leather type filter changes
  const handleLeatherFilterChange = (selectedTypes: string[]) => {
    if (selectedTypes.length === 0) {
      setFilteredFactories(factories);
      return;
    }

    const filtered = factories.filter((factory) => {
      return selectedTypes.some((type) =>
        factory.leather_types?.includes(type),
      );
    });

    setFilteredFactories(filtered);
  };

  // Handle leather finish filter changes
  const handleFinishFilterChange = (selectedFinishes: string[]) => {
    if (selectedFinishes.length === 0) {
      setFilteredFactories(factories);
      return;
    }

    const filtered = factories.filter((factory) => {
      return selectedFinishes.some((finish) =>
        factory.finishes?.includes(finish),
      );
    });

    setFilteredFactories(filtered);
  };

  // Handle tanning type filter changes
  const handleTanningFilterChange = (selectedTanning: string[]) => {
    if (selectedTanning.length === 0) {
      setFilteredFactories(factories);
      return;
    }

    const filtered = factories.filter((factory) => {
      return selectedTanning.some((tanning) =>
        factory.tanning_types?.includes(tanning),
      );
    });

    setFilteredFactories(filtered);
  };

  const handleCategoryFilterChange = (selectedCategories: string[]) => {
    if (selectedCategories.length === 0) {
      setFilteredFactories(factories);
      return;
    }

    const filtered = factories.filter((factory) => {
      return selectedCategories.some((cat) =>
        factory.product_categories?.includes(cat),
      );
    });

    setFilteredFactories(filtered);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading factories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Discover Ateliers</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.filtersContainer}>
            <FilterBar
              title="MOQ"
              options={moqOptions}
              onFilterChange={handleMoqFilterChange}
            />

            <FilterBar
              title="Leather Types"
              options={leatherOptions}
              multiSelect={true}
              onFilterChange={handleLeatherFilterChange}
            />

            <FilterBar
              title="Finishes"
              options={finishOptions}
              multiSelect={true}
              onFilterChange={handleFinishFilterChange}
            />

            <FilterBar
              title="Tanning Process"
              options={tanningOptions}
              multiSelect={true}
              onFilterChange={handleTanningFilterChange}
            />

            <FilterBar
              title="Product Categories"
              options={categoryOptions}
              multiSelect={true}
              onFilterChange={handleCategoryFilterChange}
            />
          </View>

          <View style={styles.factoriesContainer}>
            {filteredFactories.map((factory) => (
              <FactoryCard key={factory.id} factory={factory} />
            ))}

            {filteredFactories.length === 0 && (
              <View style={styles.noResults}>
                <Text style={Typography.body}>
                  No factories match your criteria. Try adjusting your filters.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
  },
  title: {
    marginBottom: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.status.errorLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: Colors.neutral[50],
  },
  factoriesContainer: {
    padding: 16,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
});
