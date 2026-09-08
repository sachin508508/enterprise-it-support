import { useRouter } from 'expo-router';

import ScreenContainer from '../components/common/ScreenContainer';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import { Colors } from '../constants/colors';

import {
  Radius,
  Spacing,
  Typography,
} from '../constants/theme';

import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
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
          Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {user?.name}
          </Text>

          <Text style={styles.email}>
            {user?.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'admin'
                ? 'Administrator'
                : 'Employee'}
            </Text>
          </View>
        </View>

        {/* Account Information */}

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <Card style={styles.card}>
          <InfoRow
            label="Full Name"
            value={user?.name ?? '-'}
          />

          <InfoRow
            label="Employee ID"
            value={user?.employee_id ?? '-'}
          />

          <InfoRow
            label="Email"
            value={user?.email ?? '-'}
            last
          />
        </Card>

        {/* Access Information */}

        <Text style={styles.sectionTitle}>
          Access
        </Text>

        <Card style={styles.card}>
          <InfoRow
            label="Role"
            value={
              user?.role === 'admin'
                ? 'Administrator'
                : 'Employee'
            }
          />

          <InfoRow
            label="Human Review"
            value={
              user?.role === 'admin'
                ? 'Administrator access'
                : 'Submit requests for review'
            }
            last
          />
        </Card>

        {/* Settings */}

        <Text style={styles.sectionTitle}>
          Settings
        </Text>

        <Card style={styles.settingsCard}>
          <Button
            title="Settings"
            variant="outline"
            onPress={() =>
              router.push('/settings')
            }
          />
        </Card>

        {/* Logout */}

        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>
          IT Support AI • Version 1.0.0
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  last?: boolean;
}

function InfoRow({
  label,
  value,
  last = false,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={styles.infoValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor:
      Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor:
      Colors.light.border,
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

  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor:
      Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  name: {
    ...Typography.title,
    color: Colors.light.text,
  },

  email: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },

  roleBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor:
      Colors.light.primaryLight,
  },

  roleText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  sectionTitle: {
    ...Typography.heading,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },

  card: {
    paddingVertical: 0,
    marginBottom: Spacing.lg,
  },

  infoRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor:
      Colors.light.border,
  },

  infoLabel: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },

  infoValue: {
    ...Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
    maxWidth: '60%',
  },

  settingsCard: {
    marginBottom: Spacing.lg,
  },

  logoutButton: {
    marginTop: Spacing.md,
  },

  version: {
    ...Typography.caption,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});