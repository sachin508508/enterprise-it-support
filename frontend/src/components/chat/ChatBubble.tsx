import {
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

import {
  ChatMessage,
} from '../../types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({
  message,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.wrapper,
        isUser
          ? styles.userWrapper
          : styles.assistantWrapper,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.message,
            isUser
              ? styles.userMessage
              : styles.assistantMessage,
          ]}
        >
          {message.content}
        </Text>

        <Text
          style={[
            styles.timestamp,
            isUser
              ? styles.userTimestamp
              : styles.assistantTimestamp,
          ]}
        >
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.md,
  },

  userWrapper: {
    alignItems: 'flex-end',
  },

  assistantWrapper: {
    alignItems: 'flex-start',
  },

  bubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },

  userBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: Radius.sm,
  },

  assistantBubble: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderBottomLeftRadius: Radius.sm,
  },

  message: {
    ...Typography.body,
  },

  userMessage: {
    color: Colors.light.surface,
  },

  assistantMessage: {
    color: Colors.light.text,
  },

  timestamp: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },

  userTimestamp: {
    color: Colors.light.primaryLight,
    textAlign: 'right',
  },

  assistantTimestamp: {
    color: Colors.light.textTertiary,
  },
});