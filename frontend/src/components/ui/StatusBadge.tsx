import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { Radius, Spacing, Typography } from '../../constants/theme';

type Status =
  | 'successful'
  | 'failed'
  | 'denied'
  | 'pending'
  | 'info';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

export default function StatusBadge({
  status,
  label,
}: StatusBadgeProps) {
  const config = {
    successful: {
      background: Colors.light.successLight,
      text: Colors.light.success,
      label: 'Successful',
    },

    failed: {
      background: Colors.light.errorLight,
      text: Colors.light.error,
      label: 'Failed',
    },

    denied: {
      background: Colors.light.warningLight,
      text: Colors.light.warning,
      label: 'Denied',
    },

    pending: {
      background: Colors.light.primaryLight,
      text: Colors.light.primary,
      label: 'Pending',
    },

    info: {
      background: Colors.light.infoLight,
      text: Colors.light.info,
      label: 'Info',
    },
  }[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.background },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: config.text },
        ]}
      />

      <Text
        style={[
          styles.text,
          { color: config.text },
        ]}
      >
        {label ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },

  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
});