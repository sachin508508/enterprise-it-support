import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { Colors } from '../../constants/colors';
import { Radius, Spacing, Typography } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'danger'
              ? Colors.light.surface
              : Colors.light.primary
          }
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  primary: {
    backgroundColor: Colors.light.primary,
  },

  secondary: {
    backgroundColor: Colors.light.surfaceSecondary,
  },

  outline: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  danger: {
    backgroundColor: Colors.light.error,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    ...Typography.bodyMedium,
  },

  primaryText: {
    color: Colors.light.surface,
  },

  secondaryText: {
    color: Colors.light.text,
  },

  outlineText: {
    color: Colors.light.primary,
  },

  dangerText: {
    color: Colors.light.surface,
  },
});
