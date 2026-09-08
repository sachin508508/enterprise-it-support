import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '../../constants/colors';

import {
  ConversationSummary,
} from '../../types/conversation';

interface ConversationCardProps {
  conversation: ConversationSummary;
  onPress: () => void;
}

export default function ConversationCard({
  conversation,
  onPress,
}: ConversationCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text
          style={styles.queryType}
          numberOfLines={1}
        >
          {conversation.query_type}
        </Text>

        <Text style={styles.date}>
          {new Date(
            conversation.created_at
          ).toLocaleDateString()}
        </Text>
      </View>

      <Text
        style={styles.query}
        numberOfLines={2}
      >
        {conversation.query}
      </Text>

      <View style={styles.footer}>
        <View
          style={[
            styles.status,
            conversation.status === 'successful'
              ? styles.successStatus
              : conversation.status === 'failed'
              ? styles.failedStatus
              : conversation.status === 'denied'
              ? styles.deniedStatus
              : styles.pendingStatus,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              conversation.status === 'successful'
                ? styles.successText
                : conversation.status === 'failed'
                ? styles.failedText
                : conversation.status === 'denied'
                ? styles.deniedText
                : styles.pendingText,
            ]}
          >
            {conversation.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  queryType: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    flex: 1,
  },

  date: {
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  query: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
    marginBottom: 14,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  successStatus: {
    backgroundColor: Colors.light.successLight,
  },

  successText: {
    color: Colors.light.success,
  },

  failedStatus: {
    backgroundColor: Colors.light.errorLight,
  },

  failedText: {
    color: Colors.light.error,
  },

  deniedStatus: {
    backgroundColor: Colors.light.errorLight,
  },

  deniedText: {
    color: Colors.light.error,
  },

  pendingStatus: {
    backgroundColor: Colors.light.warningLight,
  },

  pendingText: {
    color: Colors.light.warning,
  },
});