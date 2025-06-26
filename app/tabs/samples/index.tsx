import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import SampleCard from '@/components/samples/SampleCard';
import BottomSheet from '@/components/shared/BottomSheet';
import CustomButton from '@/components/shared/CustomButton';
import Badge from '@/components/shared/Badge';
import samplesData from '@/data/samplesData';
import { Sample } from '@/types';

export default function SamplesScreen() {
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  const handleSamplePress = (sample: Sample) => {
    setSelectedSample(sample);
    setDetailsVisible(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsVisible(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Simulate actions like approve, reject, or request rework
  const handleSampleAction = (action: 'approve' | 'reject' | 'rework') => {
    alert(`Sample ${action}ed. This would update the status in a real app.`);
    setDetailsVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h1, styles.title]}>Sample Requests</Text>
      </View>
      
      <FlatList
        data={samplesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SampleCard
            sample={item}
            onPress={handleSamplePress}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Sample Details Modal */}
      {selectedSample && (
        <BottomSheet
          isVisible={detailsVisible}
          onClose={handleCloseDetails}
          title="Sample Details"
        >
          <View style={styles.detailsContainer}>
            <View style={styles.detailHeader}>
              <Text style={[Typography.h4, styles.factoryName]}>
                {selectedSample.factoryName}
              </Text>
              <Badge 
                label={selectedSample.status.replace('_', ' ').toUpperCase()}
                variant="status"
                status={selectedSample.status}
              />
            </View>
            
            <View style={styles.detailSection}>
              <Text style={[Typography.label, styles.sectionTitle]}>Request Details</Text>
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, styles.detailLabel]}>Date Requested:</Text>
                <Text style={[Typography.body, styles.detailValue]}>
                  {formatDate(selectedSample.createdAt)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, styles.detailLabel]}>Preferred MOQ:</Text>
                <Text style={[Typography.body, styles.detailValue]}>
                  {selectedSample.preferredMoq || 'Not specified'} units
                </Text>
              </View>
              
              {selectedSample.notes && (
                <View style={styles.notes}>
                  <Text style={[Typography.bodySmall, styles.detailLabel]}>Notes:</Text>
                  <Text style={[Typography.body, styles.notesText]}>
                    {selectedSample.notes}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailSection}>
              <Text style={[Typography.label, styles.sectionTitle]}>Files</Text>
              
              {selectedSample.techPack && (
                <CustomButton
                  title="View Tech Pack"
                  variant="outline"
                  size="small"
                  style={styles.fileButton}
                  onPress={() => alert(`Opening: ${selectedSample.techPack}`)}
                />
              )}
              
              {selectedSample.sketch && (
                <CustomButton
                  title="View Sketch"
                  variant="outline"
                  size="small"
                  style={styles.fileButton}
                  onPress={() => alert(`Opening: ${selectedSample.sketch}`)}
                />
              )}
            </View>
            
            {selectedSample.status === 'in_review' && (
              <View style={styles.actionsContainer}>
                <Text style={[Typography.label, styles.sectionTitle]}>Actions</Text>
                <View style={styles.actionButtons}>
                  <CustomButton
                    title="Approve"
                    variant="primary"
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleSampleAction('approve')}
                  />
                  <CustomButton
                    title="Request Rework"
                    variant="outline"
                    style={styles.actionButton}
                    onPress={() => handleSampleAction('rework')}
                  />
                  <CustomButton
                    title="Reject"
                    variant="secondary"
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleSampleAction('reject')}
                  />
                </View>
              </View>
            )}
          </View>
        </BottomSheet>
      )}
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  factoryName: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    color: Colors.neutral[700],
  },
  detailValue: {
    flex: 1,
  },
  notes: {
    marginTop: 8,
  },
  notesText: {
    marginTop: 4,
    lineHeight: 22,
  },
  fileButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButtons: {
    marginTop: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  approveButton: {
    backgroundColor: Colors.status.success,
  },
  rejectButton: {
    backgroundColor: Colors.status.error,
  },
});