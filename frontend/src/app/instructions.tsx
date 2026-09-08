import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import ScreenContainer from '../components/common/ScreenContainer';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import { Colors } from '../constants/colors';

import {
  Spacing,
  Typography,
} from '../constants/theme';

export default function InstructionsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Button
          title="← Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
        />

        <Text style={styles.title}>
          How to Ask
        </Text>

        <Text style={styles.subtitle}>
          Include enough information so the AI can
          investigate and resolve your request
          accurately.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            🔐 Access Requests
          </Text>

          <Text style={styles.item}>
            • System or application
          </Text>

          <Text style={styles.item}>
            • Project or team
          </Text>

          <Text style={styles.item}>
            • Why you need access
          </Text>

          <Text style={styles.item}>
            • Requested role, if known
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            🛠 Technical Issues
          </Text>

          <Text style={styles.item}>
            • What isn't working
          </Text>

          <Text style={styles.item}>
            • Error message
          </Text>

          <Text style={styles.item}>
            • System or application
          </Text>

          <Text style={styles.item}>
            • When the issue started
          </Text>

          <Text style={styles.item}>
            • Device or system information
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            ⚡ Action Requests
          </Text>

          <Text style={styles.item}>
            • What action you want performed
          </Text>

          <Text style={styles.item}>
            • System or project
          </Text>

          <Text style={styles.item}>
            • Reason for the action
          </Text>

          <Text style={styles.item}>
            • Relevant identifiers
          </Text>
        </Card>

        <View style={styles.bottom}>
          <Button
            title="Start New Request"
            onPress={() =>
              router.replace('/new-request')
            }
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xxl,
  },

  title: {
    ...Typography.title,
    color: Colors.light.text,
  },

  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },

  card: {
    marginBottom: Spacing.md,
  },

  cardTitle: {
    ...Typography.heading,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },

  item: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },

  bottom: {
    marginTop: Spacing.lg,
  },
});