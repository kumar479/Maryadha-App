import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface BadgeProps {
  label: string;
  variant?: 'tag' | 'status' | 'verified';
  status?:
    | 'requested'
    | 'shipped'
    | 'in_review'
    | 'quality_check'
    | 'approved'
    | 'rejected'
    | 'invoice_sent'
    | 'sample_paid'
    | 'in_production'
    | 'delivered';
}

export default function Badge({ label, variant = 'tag', status }: BadgeProps) {
  let badgeStyle = [styles.badge];
  let textStyle = [styles.text];
  
  if (variant === 'tag') {
    badgeStyle.push(styles.tagBadge);
    textStyle.push(styles.tagText);
  } else if (variant === 'verified') {
    badgeStyle.push(styles.verifiedBadge);
    textStyle.push(styles.verifiedText);
  } else if (variant === 'status' && status) {
    switch (status) {
      case 'requested':
        badgeStyle.push(styles.requestedBadge);
        textStyle.push(styles.requestedText);
        break;
      case 'shipped':
        badgeStyle.push(styles.shippedBadge);
        textStyle.push(styles.shippedText);
        break;
      case 'in_review':
        badgeStyle.push(styles.reviewBadge);
        textStyle.push(styles.reviewText);
        break;
      case 'quality_check':
        badgeStyle.push(styles.reviewBadge);
        textStyle.push(styles.reviewText);
        break;
      case 'approved':
        badgeStyle.push(styles.approvedBadge);
        textStyle.push(styles.approvedText);
        break;
      case 'rejected':
        badgeStyle.push(styles.rejectedBadge);
        textStyle.push(styles.rejectedText);
        break;
      case 'invoice_sent':
        badgeStyle.push(styles.reviewBadge);
        textStyle.push(styles.reviewText);
        break;
      case 'sample_paid':
        badgeStyle.push(styles.approvedBadge);
        textStyle.push(styles.approvedText);
        break;
      case 'in_production':
        badgeStyle.push(styles.shippedBadge);
        textStyle.push(styles.shippedText);
        break;
      case 'delivered':
        badgeStyle.push(styles.approvedBadge);
        textStyle.push(styles.approvedText);
        break;
    }
  }

  return (
    <View style={badgeStyle}>
      {variant === 'verified' && (
        <Check size={12} color={Colors.primary[500]} style={styles.icon} />
      )}
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  // Tag badge - outline style
  tagBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  tagText: {
    color: Colors.primary[500],
  },
  // Verified badge
  verifiedBadge: {
    backgroundColor: Colors.primary[100],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  verifiedText: {
    color: Colors.primary[500],
  },
  icon: {
    marginRight: 4,
  },
  // Status badges
  requestedBadge: {
    backgroundColor: Colors.neutral[200],
  },
  requestedText: {
    color: Colors.neutral[700],
  },
  shippedBadge: {
    backgroundColor: Colors.primary[100],
  },
  shippedText: {
    color: Colors.primary[700],
  },
  reviewBadge: {
    backgroundColor: Colors.status.info + '20', // 20% opacity
  },
  reviewText: {
    color: Colors.status.info,
  },
  approvedBadge: {
    backgroundColor: Colors.status.success + '20', // 20% opacity
  },
  approvedText: {
    color: Colors.status.success,
  },
  rejectedBadge: {
    backgroundColor: Colors.status.error + '20', // 20% opacity
  },
  rejectedText: {
    color: Colors.status.error,
  },
});