import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ScreenContainer from '../components/common/ScreenContainer';

import { Colors } from '../constants/colors';

import {
  getDashboardData,
} from '../services/dashboard';

import {
  DashboardData,
} from '../types/dashboard';

import {
  useAuth,
} from '../context/AuthContext';


export default function DashboardScreen() {

  const router = useRouter();

  const insets = useSafeAreaInsets();

  const {
    user,
  } = useAuth();

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.role?.toLowerCase() === 'administrator';

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  const loadDashboard = async () => {

    try {

      const data =
        await getDashboardData();

      setDashboard(data);

    } catch (error) {

      console.error(
        'Failed to load dashboard:',
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {

      loadDashboard();

    }, [])
  );


  const refreshDashboard = () => {

    setRefreshing(true);

    loadDashboard();
  };


  if (loading) {

    return (
      <ScreenContainer>

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
          />

          <Text style={styles.loadingText}>
            Loading dashboard...
          </Text>

        </View>

      </ScreenContainer>
    );
  }


  const data = dashboard;


  return (
    <ScreenContainer
      edges={['top']}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshDashboard}
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 100,
          },
        ]}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>

          <View>

            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.name}>
              {user?.name || 'Employee'}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push('/profile')
            }
          >

            <Text style={styles.profileText}>
              {user?.name
                ?.charAt(0)
                .toUpperCase() || 'U'}
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================================================= */}
        {/* ADMIN HEADER */}
        {/* ================================================= */}

        {isAdmin && (

          <View style={styles.adminBanner}>

            <View style={styles.adminIcon}>

              <Ionicons
                name="shield-checkmark"
                size={20}
                color={Colors.light.primary}
              />

            </View>

            <View style={styles.adminBannerContent}>

              <Text style={styles.adminBannerTitle}>
                Administrator Console
              </Text>

              <Text style={styles.adminBannerText}>
                Manage human reviews and IT operations.
              </Text>

            </View>

          </View>

        )}


        {/* ================================================= */}
        {/* INTRO */}
        {/* ================================================= */}

        <View style={styles.intro}>

          <Text style={styles.title}>
            {isAdmin
              ? 'AI Operations'
              : 'AI Operations Dashboard'}
          </Text>

          <Text style={styles.subtitle}>
            {isAdmin
              ? 'Review AI decisions and monitor IT operations.'
              : 'Monitor your IT requests and AI-assisted operations.'}
          </Text>

        </View>


        {/* ================================================= */}
        {/* ADMIN PRIMARY ACTION */}
        {/* ================================================= */}

        {isAdmin && (

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.adminReviewCard}
            onPress={() =>
              router.push('/hitl-admin')
            }
          >

            <View style={styles.reviewIconContainer}>

              <Ionicons
                name="people"
                size={25}
                color="#FFFFFF"
              />

            </View>

            <View style={styles.reviewContent}>

              <Text style={styles.reviewEyebrow}>
                HUMAN-IN-THE-LOOP
              </Text>

              <Text style={styles.reviewTitle}>
                Human Review Queue
              </Text>

              <Text style={styles.reviewSubtitle}>
                Review AI decisions that need administrator attention.
              </Text>

            </View>

            <View style={styles.reviewCount}>

              <Text style={styles.reviewCountValue}>
                {data?.hitl_pending ?? 0}
              </Text>

              <Text style={styles.reviewCountLabel}>
                pending
              </Text>

            </View>

          </TouchableOpacity>

        )}


        {/* ================================================= */}
        {/* QUICK NAVIGATION */}
        {/* ================================================= */}

        <View style={styles.quickHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Quick Navigation
            </Text>

            <Text style={styles.quickSubtitle}>
              Access your most-used areas
            </Text>

          </View>

        </View>

        <View style={styles.quickGrid}>

          {!isAdmin && (
            <QuickAction
              title="New Request"
              icon="sparkles-outline"
              onPress={() =>
                router.push('/new-request')
              }
            />
          )}

          <QuickAction
            title="History"
            icon="time-outline"
            onPress={() =>
              router.push('/history')
            }
          />

          <QuickAction
            title="Instructions"
            icon="book-outline"
            onPress={() =>
              router.push('/instructions')
            }
          />

          {isAdmin && (
            <QuickAction
              title="Human Review"
              icon="people-outline"
              highlight
              onPress={() =>
                router.push('/hitl-admin')
              }
            />
          )}

          <QuickAction
            title="Profile"
            icon="person-outline"
            onPress={() =>
              router.push('/profile')
            }
          />

        </View>


        {/* ================================================= */}
        {/* TOTAL */}
        {/* ================================================= */}

        <TouchableOpacity
          style={styles.totalCard}
          activeOpacity={0.9}
          onPress={() =>
            router.push('/history')
          }
        >

          <View style={styles.totalTopRow}>

            <View>

              <Text style={styles.totalLabel}>
                Total Queries
              </Text>

              <Text style={styles.totalValue}>
                {data?.total_queries ?? 0}
              </Text>

            </View>

            <View style={styles.totalIcon}>

              <Ionicons
                name="analytics-outline"
                size={25}
                color="#FFFFFF"
              />

            </View>

          </View>

          <View style={styles.totalBottomRow}>

            <Text style={styles.totalHint}>
              View conversation history
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFFFFF"
            />

          </View>

        </TouchableOpacity>


        {/* ================================================= */}
        {/* QUERY TYPES */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Query Types
        </Text>

        <View style={styles.grid}>

          <MetricCard
            label="RAG Queries"
            value={
              data?.rag_queries ?? 0
            }
            icon="search-outline"
          />

          <MetricCard
            label="Action Queries"
            value={
              data?.action_queries ?? 0
            }
            icon="flash-outline"
          />

          <MetricCard
            label="System Information"
            value={
              data?.system_information_queries ?? 0
            }
            icon="server-outline"
          />

          <MetricCard
            label="HITL Pending"
            value={
              data?.hitl_pending ?? 0
            }
            warning
            icon="people-outline"
          />

        </View>


        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Request Status
        </Text>

        <View style={styles.statusCard}>

          <StatusRow
            label="Successful"
            value={
              data?.successful ?? 0
            }
            icon="checkmark-circle-outline"
          />

          <StatusRow
            label="Failed"
            value={
              data?.failed ?? 0
            }
            icon="close-circle-outline"
          />

          <StatusRow
            label="Denied"
            value={
              data?.denied ?? 0
            }
            icon="ban-outline"
            last
          />

        </View>


        {/* ================================================= */}
        {/* RECENT ACTIVITY */}
        {/* ================================================= */}

        <View style={styles.activityHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Recent Activity
            </Text>

          </View>

          <TouchableOpacity
            onPress={() =>
              router.push('/history')
            }
          >

            <Text style={styles.viewAll}>
              View All
            </Text>

          </TouchableOpacity>

        </View>


        {data?.recent_activity?.length ? (

          <View style={styles.activityCard}>

            {data.recent_activity.map(
              (activity, index) => (

                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index <
                      data.recent_activity.length - 1 &&
                      styles.activityBorder,
                  ]}
                  onPress={() =>
                    router.push(
                      `/conversation/${activity.id}`
                    )
                  }
                >

                  <View style={styles.activityIcon}>

                    <Ionicons
                      name={
                        activity.query_type === 'Action'
                          ? 'flash-outline'
                          : activity.query_type === 'RAG'
                            ? 'search-outline'
                            : 'document-text-outline'
                      }
                      size={18}
                      color={Colors.light.primary}
                    />

                  </View>

                  <View style={styles.activityContent}>

                    <Text
                      style={styles.activityQuery}
                      numberOfLines={2}
                    >
                      {activity.query}
                    </Text>

                    <Text style={styles.activityMeta}>
                      {activity.query_type} •{' '}
                      {new Date(
                        activity.created_at || ''
                      ).toLocaleString()}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(
                        activity.status
                      ),
                    ]}
                  >

                    <Text
                      style={[
                        styles.statusText,
                        getStatusTextStyle(
                          activity.status
                        ),
                      ]}
                    >
                      {activity.status}
                    </Text>

                  </View>

                </TouchableOpacity>

              )
            )}

          </View>

        ) : (

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={Colors.light.primary}
              />

            </View>

            <Text style={styles.emptyTitle}>
              No activity yet
            </Text>

            <Text style={styles.emptyText}>
              Start your first IT request to see
              activity here.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push('/new-request')
              }
            >

              <Ionicons
                name="sparkles-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.emptyButtonText}>
                Start New Request
              </Text>

            </TouchableOpacity>

          </View>

        )}

      </ScrollView>


      {/* ================================================= */}
      {/* FLOATING AI REQUEST BUTTON */}
      {/* ================================================= */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.floatingButton,
          {
            bottom: insets.bottom + 20,
          },
        ]}
        onPress={() =>
          router.push('/new-request')
        }
      >

        <Ionicons
          name="sparkles"
          size={24}
          color="#FFFFFF"
        />

      </TouchableOpacity>

    </ScreenContainer>
  );
}


/* ========================================================= */
/* METRIC CARD */
/* ========================================================= */

function MetricCard({
  label,
  value,
  warning = false,
  icon,
}: {
  label: string;
  value: number;
  warning?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}) {

  return (
    <View style={styles.metricCard}>

      <View style={styles.metricTop}>

        <Ionicons
          name={icon}
          size={20}
          color={
            warning
              ? Colors.light.warning
              : Colors.light.primary
          }
        />

      </View>

      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          warning &&
            styles.warningValue,
        ]}
      >
        {value}
      </Text>

    </View>
  );
}


/* ========================================================= */
/* STATUS ROW */
/* ========================================================= */

function StatusRow({
  label,
  value,
  icon,
  last = false,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}) {

  return (
    <View
      style={[
        styles.statusRow,
        !last && styles.statusBorder,
      ]}
    >

      <View style={styles.statusLeft}>

        <Ionicons
          name={icon}
          size={20}
          color={Colors.light.secondaryText}
        />

        <Text style={styles.statusLabel}>
          {label}
        </Text>

      </View>

      <Text style={styles.statusValue}>
        {value}
      </Text>

    </View>
  );
}


/* ========================================================= */
/* QUICK ACTION */
/* ========================================================= */

function QuickAction({
  title,
  icon,
  onPress,
  highlight = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  highlight?: boolean;
}) {

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.quickAction,
        highlight && styles.quickActionHighlight,
      ]}
      onPress={onPress}
    >

      <View
        style={[
          styles.quickIcon,
          highlight && styles.quickIconHighlight,
        ]}
      >

        <Ionicons
          name={icon}
          size={21}
          color={
            highlight
              ? Colors.light.warning
              : Colors.light.primary
          }
        />

      </View>

      <Text
        style={[
          styles.quickActionText,
          highlight && styles.quickActionHighlightText,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

    </TouchableOpacity>
  );
}


/* ========================================================= */
/* STATUS HELPERS */
/* ========================================================= */

function getStatusStyle(
  status: string
) {

  switch (status) {

    case 'successful':
      return {
        backgroundColor:
          Colors.light.successLight,
      };

    case 'failed':
      return {
        backgroundColor:
          Colors.light.errorLight,
      };

    case 'denied':
      return {
        backgroundColor:
          Colors.light.warningLight,
      };

    default:
      return {
        backgroundColor:
          Colors.light.surfaceSecondary,
      };
  }
}


function getStatusTextStyle(
  status: string
) {

  switch (status) {

    case 'successful':
      return {
        color:
          Colors.light.success,
      };

    case 'failed':
      return {
        color:
          Colors.light.error,
      };

    case 'denied':
      return {
        color:
          Colors.light.warning,
      };

    default:
      return {
        color:
          Colors.light.secondaryText,
      };
  }
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: Colors.light.secondaryText,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greeting: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },

  name: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  adminBanner: {
    marginTop: 18,
    padding: 14,
    borderRadius: 15,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminBannerContent: {
    flex: 1,
    marginLeft: 11,
  },

  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },

  adminBannerText: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  intro: {
    marginTop: 22,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: Colors.light.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.secondaryText,
  },

  adminReviewCard: {
    marginTop: 18,
    padding: 17,
    borderRadius: 18,
    backgroundColor: Colors.light.text,
    flexDirection: 'row',
    alignItems: 'center',
  },

  reviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewContent: {
    flex: 1,
    marginLeft: 12,
  },

  reviewEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.light.primaryLight,
  },

  reviewTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  reviewSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#CBD5E1',
  },

  reviewCount: {
    marginLeft: 10,
    alignItems: 'center',
    minWidth: 50,
  },

  reviewCountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  reviewCountLabel: {
    marginTop: 1,
    fontSize: 9,
    color: '#CBD5E1',
  },

  quickHeader: {
    marginTop: 22,
    marginBottom: 11,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },

  quickHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },

  quickSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  quickAction: {
    width: '48%',
    minHeight: 82,
    padding: 12,
    borderRadius: 15,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'center',
  },

  quickActionHighlight: {
    backgroundColor: Colors.light.warningLight,
    borderColor: Colors.light.warning,
  },

  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  quickIconHighlight: {
    backgroundColor: '#FFFFFF',
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },

  quickActionHighlightText: {
    color: Colors.light.warning,
  },

  totalCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
  },

  totalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  totalValue: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalBottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  totalHint: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  metricCard: {
    width: '48%',
    minHeight: 112,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  metricTop: {
    marginBottom: 9,
  },

  metricLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.secondaryText,
  },

  metricValue: {
    marginTop: 7,
    fontSize: 27,
    fontWeight: '800',
    color: Colors.light.text,
  },

  warningValue: {
    color: Colors.light.warning,
  },

  statusCard: {
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  statusRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusLabel: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },

  statusValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },

  activityHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  activityCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },

  activityItem: {
    minHeight: 82,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityContent: {
    flex: 1,
  },

  activityQuery: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },

  activityMeta: {
    marginTop: 5,
    fontSize: 11,
    color: Colors.light.mutedText,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  emptyCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },

  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.secondaryText,
  },

  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  floatingButton: {
    position: 'absolute',
    left: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
});