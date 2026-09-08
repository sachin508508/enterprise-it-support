import { useState } from 'react';
import { useRouter } from 'expo-router';

import ScreenContainer from '../components/common/ScreenContainer';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import { Colors } from '../constants/colors';

import {
  Spacing,
  Typography,
} from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  const handleLanguage = () => {
    Alert.alert(
      'Language',
      'Language selection will be connected to the backend later.'
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy',
      'Your IT requests and account information are handled according to company policy.'
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'IT Support AI',
      'Enterprise IT Operations Assistant\n\nVersion 1.0.0'
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
        />

        <Text style={styles.headerTitle}>
          Settings
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}

        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        <Card style={styles.card}>
          <SettingRow
            title="Notifications"
            description="Receive updates about your IT requests"
          >
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                false: Colors.light.border,
                true: Colors.light.primaryLight,
              }}
              thumbColor={
                notifications
                  ? Colors.light.primary
                  : Colors.light.textTertiary
              }
            />
          </SettingRow>

          <SettingRow
            title="Appearance"
            description="Use dark mode"
            last
          >
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{
                false: Colors.light.border,
                true: Colors.light.primaryLight,
              }}
              thumbColor={
                darkMode
                  ? Colors.light.primary
                  : Colors.light.textTertiary
              }
            />
          </SettingRow>
        </Card>

        {/* General */}

        <Text style={styles.sectionTitle}>
          General
        </Text>

        <Card style={styles.card}>
          <Button
            title="Language"
            variant="outline"
            onPress={handleLanguage}
            style={styles.optionButton}
          />

          <Button
            title="Privacy"
            variant="outline"
            onPress={handlePrivacy}
            style={styles.optionButton}
          />

          <Button
            title="About IT Support AI"
            variant="outline"
            onPress={handleAbout}
          />
        </Card>

        {/* Information */}

        <Text style={styles.sectionTitle}>
          Application
        </Text>

        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Version
            </Text>

            <Text style={styles.infoValue}>
              1.0.0
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Platform
            </Text>

            <Text style={styles.infoValue}>
              Mobile
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              AI Operations
            </Text>

            <Text style={styles.infoValue}>
              Enabled
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
  last?: boolean;
}

function SettingRow({
  title,
  description,
  children,
  last = false,
}: SettingRowProps) {
  return (
    <View
      style={[
        styles.settingRow,
        !last && styles.settingBorder,
      ]}
    >
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  backButton: {
    minHeight: 42,
    paddingHorizontal: Spacing.md,
  },

  headerTitle: {
    ...Typography.heading,
    color: Colors.light.text,
  },

  headerSpacer: {
    width: 70,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },

  sectionTitle: {
    ...Typography.heading,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },

  card: {
    marginBottom: Spacing.lg,
  },

  settingRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  settingText: {
    flex: 1,
    paddingRight: Spacing.lg,
  },

  settingTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },

  settingDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },

  optionButton: {
    marginBottom: Spacing.md,
  },

  infoRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },

  infoValue: {
    ...Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
  },
});