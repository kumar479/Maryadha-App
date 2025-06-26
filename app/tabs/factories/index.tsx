import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import FilterBar from '@/components/factory/FilterBar';
import FactoryCard from '@/components/factory/FactoryCard';
import factoriesData from '@/data/factoriesData';

export default function FactoriesScreen() {
  const [filteredFactories, setFilteredFactories] = useState(factoriesData);

  // MOQ filter options
  const moqOptions = [
    { label: '<50', value: 'moq_lt_50' },
    { label: '50-100', value: 'moq_50_100' },
    { label: '100+', value: 'moq_gt_100' },
  ];

  // Updated leather type filter options
  const leatherOptions = [
    { label: 'Cowhide', value: 'Cowhide' },
    { label: 'Lambskin', value: 'Lambskin' },
    { label: 'Goatskin', value: 'Goatskin' },
    { label: 'Calfskin', value: 'Calfskin' },
    { label: 'Sheepskin', value: 'Sheepskin (Shearling)' },
  ];

  // Updated tag filter options
  const tagOptions = [
    { label: 'Distressed', value: 'Distressed' },
    { label: 'Polished', value: 'Polished' },
    { label: 'Matte', value: 'Matte' },
    { label: 'Pebbled', value: 'Pebbled' },
    { label: 'Suede', value: 'Suede' },
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
      setFilteredFactories(factoriesData);
      return;
    }

    const filtered = factoriesData.filter((factory) => {
      if (selectedMoqs.includes('moq_lt_50') && factory.moq < 50) {
        return true;
      }
      if (
        selectedMoqs.includes('moq_50_100') &&
        factory.moq >= 50 &&
        factory.moq <= 100
      ) {
        return true;
      }
      if (selectedMoqs.includes('moq_gt_100') && factory.moq > 100) {
        return true;
      }
      return false;
    });

    setFilteredFactories(filtered);
  };

  // Handle leather type filter changes
  const handleLeatherFilterChange = (selectedTypes: string[]) => {
    if (selectedTypes.length === 0) {
      setFilteredFactories(factoriesData);
      return;
    }

    const filtered = factoriesData.filter((factory) => {
      return selectedTypes.some((type) => factory.leatherTypes.includes(type));
    });

    setFilteredFactories(filtered);
  };

  // Handle tag filter changes
  const handleTagFilterChange = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setFilteredFactories(factoriesData);
      return;
    }

    const filtered = factoriesData.filter((factory) => {
      return selectedTags.some((tag) => factory.tags.includes(tag));
    });

    setFilteredFactories(filtered);
  };

  const handleCategoryFilterChange = (selectedCategories: string[]) => {
    if (selectedCategories.length === 0) {
      setFilteredFactories(factoriesData);
      return;
    }

    const filtered = factoriesData.filter((factory) => {
      return selectedCategories.some((cat) =>
        factory.productCategories.includes(cat),
      );
    });

    setFilteredFactories(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Discover Ateliers</Text>
      </View>

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
            options={tagOptions}
            multiSelect={true}
            onFilterChange={handleTagFilterChange}
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
  },
  title: {
    marginBottom: 16,
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
