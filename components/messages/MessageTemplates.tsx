import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface MessageTemplatesProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

export default function MessageTemplates({ templates, onSelect }: MessageTemplatesProps) {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <View style={styles.container}>
      <Text style={[Typography.h4, styles.title]}>Quick Responses</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <View key={category} style={styles.category}>
              <Text style={[Typography.label, styles.categoryTitle]}>
                {category.replace('_', ' ').toUpperCase()}
              </Text>
              
              {templates
                .filter(t => t.category === category)
                .map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.template}
                    onPress={() => onSelect(template)}
                  >
                    <Text style={[Typography.bodySmall, styles.templateTitle]}>
                      {template.title}
                    </Text>
                    <Text 
                      style={[Typography.caption, styles.templatePreview]}
                      numberOfLines={2}
                    >
                      {template.content}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  category: {
    width: 280,
    marginRight: 16,
  },
  categoryTitle: {
    color: Colors.neutral[500],
    marginBottom: 8,
  },
  template: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  templateTitle: {
    color: Colors.primary[700],
    marginBottom: 4,
  },
  templatePreview: {
    color: Colors.neutral[600],
  },
});