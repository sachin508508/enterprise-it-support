import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { Radius, Spacing, Typography } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        style={[
          styles.input,
          error ? styles.inputError : undefined,
          props.style,
        ]}
        placeholderTextColor={Colors.light.textTertiary}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },

  label: {
    ...Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },

  input: {
    width: '100%',
    minHeight: 52,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.light.text,
    fontSize: 16,
  },

  inputError: {
    borderColor: Colors.light.error,
  },

  error: {
    ...Typography.caption,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});