import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const canSend =
    value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Describe your IT issue or request..."
        placeholderTextColor={
          Colors.light.textTertiary
        }
        multiline
        editable={!disabled}
        style={styles.input}
      />

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
        ]}
      >
        <Text
          style={[
            styles.sendText,
            !canSend && styles.sendTextDisabled,
          ]}
        >
          ↑
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.light.text,
    ...Typography.body,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },

  sendButtonDisabled: {
    backgroundColor: Colors.light.border,
  },

  sendText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.surface,
    marginTop: -2,
  },

  sendTextDisabled: {
    color: Colors.light.textTertiary,
  },
});