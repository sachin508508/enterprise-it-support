import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { Colors } from '../../constants/colors';
import { DashboardActivity } from '../../types/dashboard';

interface ActivityCardProps {
  activity: DashboardActivity;
}

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push(
          `/conversation/${activity.id}`
        )
      }
    >
      <View style={styles.content}>
        <Text
          style={styles.query}
          numberOfLines={2}
        >
          {activity.query}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.type}>
            {activity.query_type}
          </Text>

          <View style={styles.dot} />

          <Text style={styles.date}>
            {formatDate(
              activity.created_at
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          getStatusStyle(
            activity.status
          ),
        ]}
      >
        <Text
          style={[
            styles.statusText,
            getStatusTextStyle(
              activity.status
            ),
          ]}
        >
          {activity.status}
        </Text>
      </View>
    </Pressable>
  );
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return '';
  }

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function getStatusStyle(
  status: string
) {
  switch (status) {
    case 'successful':
      return {
        backgroundColor:
          Colors.light.successLight,
      };

    case 'failed':
      return {
        backgroundColor:
          Colors.light.errorLight,
      };

    case 'denied':
      return {
        backgroundColor:
          Colors.light.warningLight,
      };

    default:
      return {
        backgroundColor:
          Colors.light.infoLight,
      };
  }
}

function getStatusTextStyle(
  status: string
) {
  switch (status) {
    case 'successful':
      return {
        color: Colors.light.success,
      };

    case 'failed':
      return {
        color: Colors.light.error,
      };

    case 'denied':
      return {
        color: Colors.light.warning,
      };

    default:
      return {
        color: Colors.light.info,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      Colors.light.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  content: {
    flex: 1,
    marginRight: 12,
  },

  query: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  type: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '700',
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 7,
    backgroundColor:
      Colors.light.mutedText,
  },

  date: {
    fontSize: 11,
    color: Colors.light.mutedText,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});