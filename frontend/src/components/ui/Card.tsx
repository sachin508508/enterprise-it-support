import { StyleSheet, View, ViewProps } from 'react-native';

import { Colors } from '../../constants/colors';
import { Radius, Shadows, Spacing } from '../../constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export default function Card({
  children,
  style,
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
});