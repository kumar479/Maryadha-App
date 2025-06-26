import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
  onFilterChange: (selectedFilters: string[]) => void;
}

export default function FilterBar({ title, options, multiSelect = false, onFilterChange }: FilterBarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (value: string) => {
    let newSelectedFilters: string[];
    
    if (multiSelect) {
      if (selectedFilters.includes(value)) {
        newSelectedFilters = selectedFilters.filter(filter => filter !== value);
      } else {
        newSelectedFilters = [...selectedFilters, value];
      }
    } else {
      if (selectedFilters.includes(value)) {
        newSelectedFilters = [];
      } else {
        newSelectedFilters = [value];
      }
    }
    
    setSelectedFilters(newSelectedFilters);
    onFilterChange(newSelectedFilters);
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.label, styles.title]}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option, index) => {
          const isSelected = selectedFilters.includes(option.value);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterPill,
                isSelected && styles.filterPillSelected
              ]}
              onPress={() => toggleFilter(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                Typography.bodySmall,
                styles.filterPillText,
                isSelected && styles.filterPillTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterPillSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterPillText: {
    color: Colors.neutral[700],
  },
  filterPillTextSelected: {
    color: Colors.neutral[50],
  },
});