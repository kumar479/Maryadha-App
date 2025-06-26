import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star, TriangleAlert as AlertTriangle, Camera, Upload, Package, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { supabase } from '@/lib/supabase';
import CustomButton from '@/components/shared/CustomButton';
import BottomSheet from '@/components/shared/BottomSheet';
import Badge from '@/components/shared/Badge';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [ratings, setRatings] = useState({
    craftsmanship: 0,
    communication: 0,
    delivery: 0
  });
  const [feedbackComment, setFeedbackComment] = useState('');
  const [issueType, setIssueType] = useState<'quality' | 'delivery' | 'communication'>('quality');
  const [issueDescription, setIssueDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showQCModal, setShowQCModal] = useState(false);
  const [qcPassed, setQcPassed] = useState(true);
  const [qcNotes, setQcNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          brands (name, email),
          factories (name),
          order_feedback (*),
          order_quality_checks (*),
          order_issues (
            id,
            issue_type,
            status,
            description,
            created_at,
            issue_attachments (*)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!ratings.craftsmanship || !ratings.communication || !ratings.delivery) {
      setError('Please provide all ratings');
      return;
    }

    try {
      setSubmitting(true);
      const { error: feedbackError } = await supabase
        .from('order_feedback')
        .insert({
          order_id: id,
          brand_id: order.brand_id,
          craftsmanship_rating: ratings.craftsmanship,
          communication_rating: ratings.communication,
          delivery_rating: ratings.delivery,
          comments: feedbackComment.trim() || null
        });

      if (feedbackError) throw feedbackError;

      setShowFeedbackModal(false);
      loadOrderDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueDescription.trim()) {
      setError('Please describe the issue');
      return;
    }

    try {
      setSubmitting(true);
      const { data: issue, error: issueError } = await supabase
        .from('order_issues')
        .insert({
          order_id: id,
          brand_id: order.brand_id,
          issue_type: issueType,
          description: issueDescription.trim()
        })
        .select()
        .single();

      if (issueError) throw issueError;

      // Upload attachments
      if (attachments.length > 0) {
        const attachmentPromises = attachments.map(url =>
          supabase
            .from('issue_attachments')
            .insert({
              issue_id: issue.id,
              url,
              type: 'image'
            })
        );

        await Promise.all(attachmentPromises);
      }

      setShowIssueModal(false);
      loadOrderDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQCResult = async () => {
    try {
      setSubmitting(true);
      const { error: qcError } = await supabase
        .from('order_quality_checks')
        .insert({
          order_id: id,
          rep_id: order.rep_id,
          passed: qcPassed,
          notes: qcNotes.trim() || null,
        });

      if (qcError) throw qcError;

      setShowQCModal(false);
      setQcNotes('');
      loadOrderDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording QC result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAttachment = () => {
    // In a real app, this would open the camera or file picker
    alert('This would open the camera or file picker');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={Typography.body}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomButton
          title="Back"
          variant="outline"
          size="small"
          icon={<ArrowLeft size={20} color={Colors.primary[500]} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={[Typography.h2, styles.title]}>Order #{id.slice(0, 8)}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={[Typography.h4]}>Status</Text>
            <Badge 
              label={order.status.replace('_', ' ').toUpperCase()}
              variant="status"
              status={order.status}
            />
          </View>

          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Factory:</Text>
            <Text style={[Typography.body, styles.value]}>{order.factories.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Quantity:</Text>
            <Text style={[Typography.body, styles.value]}>{order.quantity} units</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[Typography.bodySmall, styles.label]}>Total Amount:</Text>
            <Text style={[Typography.body, styles.value]}>
              {order.currency} {order.total_amount.toFixed(2)}
            </Text>
          </View>

          {order.tracking_number && (
            <View style={styles.detailRow}>
              <Text style={[Typography.bodySmall, styles.label]}>Tracking:</Text>
              <Text style={[Typography.body, styles.value]}>{order.tracking_number}</Text>
            </View>
          )}
        </View>

        {order.status === 'quality_check' && (
          <View style={styles.feedbackPrompt}>
            <Text style={[Typography.body, styles.promptText]}>
              The order is undergoing quality checks. Record the result once inspection is complete.
            </Text>
            <CustomButton
              title="Record QC Result"
              onPress={() => setShowQCModal(true)}
              icon={<Star size={20} color="white" />}
              style={styles.feedbackButton}
            />
          </View>
        )}

        {order.status === 'delivered' && !order.order_feedback && (
          <View style={styles.feedbackPrompt}>
            <Text style={[Typography.body, styles.promptText]}>
              How was your experience with this order?
            </Text>
            <CustomButton
              title="Leave Feedback"
              onPress={() => setShowFeedbackModal(true)}
              icon={<Star size={20} color="white" />}
              style={styles.feedbackButton}
            />
          </View>
        )}

        {order.order_feedback && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>Your Feedback</Text>
            <View style={styles.ratings}>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Craftsmanship</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= order.order_feedback.craftsmanship_rating ? Colors.primary[500] : Colors.neutral[300]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Communication</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= order.order_feedback.communication_rating ? Colors.primary[500] : Colors.neutral[300]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Delivery</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= order.order_feedback.delivery_rating ? Colors.primary[500] : Colors.neutral[300]}
                    />
                  ))}
                </View>
              </View>
            </View>
            {order.order_feedback.comments && (
              <Text style={styles.feedbackComment}>{order.order_feedback.comments}</Text>
            )}
          </View>
        )}

        {order.order_issues?.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.h4, styles.sectionTitle]}>Issues</Text>
            {order.order_issues.map((issue: any) => (
              <View key={issue.id} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Badge
                    label={issue.issue_type.toUpperCase()}
                    variant="status"
                    status={issue.status}
                  />
                  <Text style={styles.issueDate}>
                    {new Date(issue.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.issueDescription}>{issue.description}</Text>
                {issue.issue_attachments?.length > 0 && (
                  <View style={styles.attachments}>
                    {issue.issue_attachments.map((attachment: any) => (
                      <Image
                        key={attachment.id}
                        source={{ uri: attachment.url }}
                        style={styles.attachmentImage}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {order.status === 'quality_check' && (
            <CustomButton
              title="Record QC Result"
              onPress={() => setShowQCModal(true)}
              icon={<Star size={20} color="white" />}
              style={styles.actionButton}
            />
          )}
          <CustomButton
            title="Report an Issue"
            variant="outline"
            onPress={() => setShowIssueModal(true)}
            icon={<AlertTriangle size={20} color={Colors.primary[500]} />}
            style={styles.actionButton}
          />
          <CustomButton
            title="Open Chat"
            onPress={() => router.push(`/messages/${order.id}`)}
            icon={<MessageSquare size={20} color="white" />}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <BottomSheet
        isVisible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Order Feedback"
      >
        <View style={styles.modalContent}>
          <Text style={[Typography.body, styles.modalText]}>
            Please rate your experience with this order:
          </Text>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Craftsmanship</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatings(prev => ({ ...prev, craftsmanship: star }))}
                >
                  <Star
                    size={32}
                    color={star <= ratings.craftsmanship ? Colors.primary[500] : Colors.neutral[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Communication</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatings(prev => ({ ...prev, communication: star }))}
                >
                  <Star
                    size={32}
                    color={star <= ratings.communication ? Colors.primary[500] : Colors.neutral[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Delivery</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatings(prev => ({ ...prev, delivery: star }))}
                >
                  <Star
                    size={32}
                    color={star <= ratings.delivery ? Colors.primary[500] : Colors.neutral[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[Typography.label, styles.inputLabel]}>Additional Comments</Text>
            <TextInput
              style={styles.textArea}
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
            />
          </View>

          <CustomButton
            title="Submit Feedback"
            onPress={handleSubmitFeedback}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      </BottomSheet>

      {/* Quality Check Modal */}
      <BottomSheet
        isVisible={showQCModal}
        onClose={() => setShowQCModal(false)}
        title="Quality Check Result"
      >
        <View style={styles.modalContent}>
          <Text style={[Typography.body, styles.modalText]}>Did this order pass quality inspection?</Text>
          <View style={styles.qcOptions}>
            <TouchableOpacity
              style={[styles.qcOption, qcPassed && styles.qcOptionSelected]}
              onPress={() => setQcPassed(true)}
            >
              <Text style={[styles.qcOptionText, qcPassed && styles.qcOptionTextSelected]}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.qcOption, !qcPassed && styles.qcOptionSelected]}
              onPress={() => setQcPassed(false)}
            >
              <Text style={[styles.qcOptionText, !qcPassed && styles.qcOptionTextSelected]}>Fail</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[Typography.label, styles.inputLabel]}>Notes</Text>
            <TextInput
              style={styles.textArea}
              value={qcNotes}
              onChangeText={setQcNotes}
              placeholder="Optional notes about the inspection"
              multiline
              numberOfLines={4}
            />
          </View>
          <CustomButton
            title="Submit Result"
            onPress={handleSubmitQCResult}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      </BottomSheet>

      {/* Issue Modal */}
      <BottomSheet
        isVisible={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Report an Issue"
      >
        <View style={styles.modalContent}>
          <View style={styles.issueTypes}>
            <TouchableOpacity
              style={[
                styles.issueType,
                issueType === 'quality' && styles.issueTypeSelected
              ]}
              onPress={() => setIssueType('quality')}
            >
              <Package
                size={24}
                color={issueType === 'quality' ? Colors.primary[500] : Colors.neutral[500]}
              />
              <Text style={[
                styles.issueTypeText,
                issueType === 'quality' && styles.issueTypeTextSelected
              ]}>
                Quality
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.issueType,
                issueType === 'delivery' && styles.issueTypeSelected
              ]}
              onPress={() => setIssueType('delivery')}
            >
              <Package
                size={24}
                color={issueType === 'delivery' ? Colors.primary[500] : Colors.neutral[500]}
              />
              <Text style={[
                styles.issueTypeText,
                issueType === 'delivery' && styles.issueTypeTextSelected
              ]}>
                Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.issueType,
                issueType === 'communication' && styles.issueTypeSelected
              ]}
              onPress={() => setIssueType('communication')}
            >
              <MessageSquare
                size={24}
                color={issueType === 'communication' ? Colors.primary[500] : Colors.neutral[500]}
              />
              <Text style={[
                styles.issueTypeText,
                issueType === 'communication' && styles.issueTypeTextSelected
              ]}>
                Communication
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[Typography.label, styles.inputLabel]}>Describe the Issue</Text>
            <TextInput
              style={styles.textArea}
              value={issueDescription}
              onChangeText={setIssueDescription}
              placeholder="Please provide details about the issue..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.attachmentSection}>
            <Text style={[Typography.label, styles.inputLabel]}>Add Photos</Text>
            <View style={styles.attachmentButtons}>
              <CustomButton
                title="Take Photo"
                variant="outline"
                size="small"
                icon={<Camera size={20} color={Colors.primary[500]} />}
                onPress={handleAddAttachment}
                style={styles.attachmentButton}
              />
              <CustomButton
                title="Upload Photo"
                variant="outline"
                size="small"
                icon={<Upload size={20} color={Colors.primary[500]} />}
                onPress={handleAddAttachment}
                style={styles.attachmentButton}
              />
            </View>
            {attachments.length > 0 && (
              <View style={styles.attachmentPreviews}>
                {attachments.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.attachmentPreview}
                  />
                ))}
              </View>
            )}
          </View>

          <CustomButton
            title="Submit Issue"
            onPress={handleSubmitIssue}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      </BottomSheet>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.status.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.neutral[50],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 120,
    color: Colors.neutral[700],
  },
  value: {
    flex: 1,
  },
  feedbackPrompt: {
    backgroundColor: Colors.primary[50],
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  promptText: {
    marginBottom: 12,
    color: Colors.primary[900],
  },
  feedbackButton: {
    alignSelf: 'flex-start',
  },
  ratings: {
    marginBottom: 16,
  },
  ratingItem: {
    marginBottom: 12,
  },
  ratingLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  feedbackComment: {
    ...Typography.body,
    color: Colors.neutral[700],
    fontStyle: 'italic',
  },
  issueCard: {
    backgroundColor: Colors.neutral[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueDate: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  issueDescription: {
    ...Typography.body,
    color: Colors.neutral[900],
    marginBottom: 12,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 8,
  },
  modalContent: {
    padding: 16,
  },
  modalText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  issueTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  issueType: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    marginHorizontal: 4,
  },
  issueTypeSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  issueTypeText: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
    marginTop: 8,
  },
  issueTypeTextSelected: {
    color: Colors.primary[500],
  },
  attachmentSection: {
    marginBottom: 24,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  attachmentButton: {
    flex: 1,
  },
  attachmentPreviews: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  qcOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qcOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  qcOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  qcOptionText: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
  },
  qcOptionTextSelected: {
    color: Colors.primary[500],
  },
  submitButton: {
    marginTop: 8,
  },
});