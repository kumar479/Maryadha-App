import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import Colors from '../../constants/Colors';
import { Download, FileText } from 'lucide-react-native';

interface ChatBubbleProps {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  attachments?: string[];
}

export default function ChatBubble({
  message,
  timestamp,
  isOutgoing,
  attachments = [],
}: ChatBubbleProps) {
  const handleAttachmentPress = (url: string) => {
    Linking.openURL(url);
  };
  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  };
  return (
    <View style={[
      styles.container,
      isOutgoing ? styles.outgoingContainer : styles.incomingContainer
    ]}>
      {attachments.map((url, index) => (
        <View key={index} style={styles.attachmentContainer}>
          {isImage(url) ? (
            <TouchableOpacity onPress={() => handleAttachmentPress(url)}>
              <Image source={{ uri: url }} style={styles.attachmentImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.fileRow} onPress={() => handleAttachmentPress(url)}>
              <FileText size={20} />
              <Text style={styles.fileName}>{url.split('/').pop()}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.downloadButton} onPress={() => handleAttachmentPress(url)}>
            <Download size={16} />
          </TouchableOpacity>
        </View>
      ))}
      <Text style={[
        styles.message,
        isOutgoing ? styles.outgoingMessage : styles.incomingMessage
      ]}>
        {message}
      </Text>
      <Text style={[
        styles.timestamp,
        isOutgoing ? styles.outgoingTimestamp : styles.incomingTimestamp
      ]}>
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  outgoingContainer: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[500],
  },
  incomingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral[200],
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  outgoingMessage: {
    color: 'white',
  },
  incomingMessage: {
    color: Colors.neutral[900],
  },
  timestamp: {
    fontSize: 12,
  },
  outgoingTimestamp: {
    color: Colors.neutral[100],
    alignSelf: 'flex-end',
  },
  incomingTimestamp: {
    color: Colors.neutral[500],
    alignSelf: 'flex-start',
  },
  attachmentContainer: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutral[100],
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
  },
  downloadButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});