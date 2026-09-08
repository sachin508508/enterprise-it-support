import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Colors,
} from '../../constants/colors';

import {
  Radius,
  Spacing,
  Typography,
} from '../../constants/theme';

interface ProcessingIndicatorProps {
  message?: string;
}

export default function ProcessingIndicator({
  message = 'AI is analyzing your request...',
}: ProcessingIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <ActivityIndicator
          size="small"
          color={Colors.light.primary}
        />

        <Text style={styles.text}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },

  text: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
});