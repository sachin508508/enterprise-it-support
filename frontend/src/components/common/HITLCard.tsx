import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '../../constants/colors';
import { HITLRequest } from '../../types/hitl';

interface HITLCardProps {
  request: HITLRequest;
  onPress: () => void;
}

export default function HITLCard({
  request,
  onPress,
}: HITLCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            Human Review Request
          </Text>

          <Text style={styles.employee}>
            {request.employee_id}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {request.status}
          </Text>
        </View>
      </View>

      <Text
        style={styles.reason}
        numberOfLines={3}
      >
        {request.reason}
      </Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            Employee
          </Text>

          <Text style={styles.metaValue}>
            {request.employee_id}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            Created
          </Text>

          <Text style={styles.metaValue}>
            {formatDate(
              request.created_at
            )}
          </Text>
        </View>
      </View>

      <Text style={styles.action}>
        Review →
      </Text>
    </Pressable>
  );
}

function formatDate(
  value: string
): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      Colors.light.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleContainer: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },

  employee: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor:
      Colors.light.warningLight,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.warning,
    textTransform: 'capitalize',
  },

  reason: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.text,
  },

  meta: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },

  metaItem: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 11,
    color: Colors.light.mutedText,
  },

  metaValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.secondaryText,
  },

  action: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});