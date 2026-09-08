import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Card from '../ui/Card';
import { Colors } from '../../constants/colors';
import {
  Spacing,
  Typography,
} from '../../constants/theme';

interface MetricCardProps {
  title: string;
  value: number;
  description?: string;
}

export default function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

      {description ? (
        <Text style={styles.description}>
          {description}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },

  value: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },

  description: {
    ...Typography.caption,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
  },
});