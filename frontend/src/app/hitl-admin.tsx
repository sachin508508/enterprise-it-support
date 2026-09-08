import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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

import ScreenContainer from '../components/common/ScreenContainer';

import { Colors } from '../constants/colors';

import {
  getAdminHITLQueue,
} from '../services/hitl';

import { HITLRequest } from '../types/hitl';


export default function HITLAdminScreen() {

  const router = useRouter();

  const [requests, setRequests] =
    useState<HITLRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  const loadRequests = async () => {

    try {

      const response =
        await getAdminHITLQueue('pending');

      setRequests(
        response.requests
      );

    } catch (error) {

      console.error(
        'Failed to load HITL queue:',
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {

      loadRequests();

    }, [])
  );


  const refresh = () => {

    setRefreshing(true);

    loadRequests();
  };


  const renderItem = ({
    item,
  }: {
    item: HITLRequest;
  }) => (

    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() =>
        router.push(
          `/hitl-review/${item.id}`
        )
      }
    >

      {/* ================================================= */}
      {/* REQUEST HEADER */}
      {/* ================================================= */}

      <View style={styles.cardHeader}>

        <View style={styles.requesterContainer}>

          <View style={styles.requesterIcon}>

            <Ionicons
              name="person"
              size={17}
              color={Colors.light.primary}
            />

          </View>

          <View>

            <Text style={styles.requesterLabel}>
              REQUESTER
            </Text>

            <Text style={styles.employee}>
              {item.employee_id}
            </Text>

          </View>

        </View>

        <View style={styles.pendingBadge}>

          <View style={styles.pendingDot} />

          <Text style={styles.pendingText}>
            PENDING
          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* CONTEXT */}
      {/* ================================================= */}

      <View style={styles.contextSection}>

        <View style={styles.contextHeader}>

          <Ionicons
            name="document-text-outline"
            size={17}
            color={Colors.light.secondaryText}
          />

          <Text style={styles.contextTitle}>
            Human review required
          </Text>

        </View>

        <Text style={styles.contextText}>
          This request was escalated because the
          AI could not complete or authorize the
          original operation.
        </Text>

      </View>


      {/* ================================================= */}
      {/* REQUESTER REASON */}
      {/* ================================================= */}

      <View style={styles.reasonSection}>

        <Text style={styles.sectionLabel}>
          REQUESTER'S REASON
        </Text>

        <Text
          style={styles.reason}
          numberOfLines={4}
        >
          {item.reason}
        </Text>

      </View>


      {/* ================================================= */}
      {/* REVIEW CTA */}
      {/* ================================================= */}

      <View style={styles.reviewRow}>

        <Text style={styles.reviewText}>
          Review request details
        </Text>

        <View style={styles.arrowCircle}>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />

        </View>

      </View>


      {/* ================================================= */}
      {/* DATE */}
      {/* ================================================= */}

      <View style={styles.dateRow}>

        <Ionicons
          name="time-outline"
          size={13}
          color={Colors.light.mutedText}
        />

        <Text style={styles.date}>
          Submitted{' '}
          {new Date(
            item.created_at
          ).toLocaleString()}
        </Text>

      </View>

    </TouchableOpacity>
  );


  if (loading) {

    return (
      <ScreenContainer>

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
          />

          <Text style={styles.loadingText}>
            Loading review queue...
          </Text>

        </View>

      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>

      <View style={styles.container}>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.topHeader}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >

            <Ionicons
              name="arrow-back"
              size={21}
              color={Colors.light.text}
            />

          </TouchableOpacity>

          <View style={styles.headerText}>

            <View style={styles.adminLabelRow}>

              <Ionicons
                name="shield-checkmark"
                size={15}
                color={Colors.light.primary}
              />

              <Text style={styles.adminLabel}>
                ADMIN CONSOLE
              </Text>

            </View>

            <Text style={styles.title}>
              Human Review
            </Text>

            <Text style={styles.subtitle}>
              Review AI decisions that require human
              intervention.
            </Text>

          </View>

        </View>


        {/* ================================================= */}
        {/* QUEUE SUMMARY */}
        {/* ================================================= */}

        <View style={styles.queueSummary}>

          <View style={styles.queueIcon}>

            <Ionicons
              name="people"
              size={22}
              color={Colors.light.warning}
            />

          </View>

          <View style={styles.queueSummaryText}>

            <Text style={styles.queueSummaryLabel}>
              PENDING REVIEWS
            </Text>

            <Text style={styles.queueSummaryValue}>
              {requests.length}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
          >

            <Ionicons
              name="refresh"
              size={19}
              color={Colors.light.primary}
            />

          </TouchableOpacity>

        </View>


        {/* ================================================= */}
        {/* QUEUE */}
        {/* ================================================= */}

        {requests.length === 0 ? (

          <View style={styles.empty}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="checkmark-circle"
                size={34}
                color={Colors.light.success}
              />

            </View>

            <Text style={styles.emptyTitle}>
              All clear
            </Text>

            <Text style={styles.emptyText}>
              There are currently no requests
              waiting for human review.
            </Text>

          </View>

        ) : (

          <FlatList
            data={requests}
            keyExtractor={(item) =>
              item.id
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.list
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
              />
            }
          />

        )}

      </View>

    </ScreenContainer>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: Colors.light.secondaryText,
  },

  topHeader: {
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  adminLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  adminLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.light.primary,
  },

  title: {
    marginTop: 3,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.secondaryText,
  },

  queueSummary: {
    marginTop: 18,
    padding: 15,
    borderRadius: 16,
    backgroundColor: Colors.light.warningLight,
    borderWidth: 1,
    borderColor: Colors.light.warning,
    flexDirection: 'row',
    alignItems: 'center',
  },

  queueIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  queueSummaryText: {
    flex: 1,
    marginLeft: 12,
  },

  queueSummaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.light.warning,
  },

  queueSummaryValue: {
    marginTop: 1,
    fontSize: 25,
    fontWeight: '800',
    color: Colors.light.text,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    paddingTop: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  requesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requesterIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  requesterLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.light.mutedText,
  },

  employee: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: Colors.light.warningLight,
  },

  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.warning,
    marginRight: 5,
  },

  pendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.warning,
  },

  contextSection: {
    marginTop: 15,
    padding: 13,
    borderRadius: 13,
    backgroundColor: Colors.light.surfaceSecondary,
  },

  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  contextTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },

  contextText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.secondaryText,
  },

  reasonSection: {
    marginTop: 15,
  },

  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.light.mutedText,
  },

  reason: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.text,
  },

  reviewRow: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  date: {
    fontSize: 10,
    color: Colors.light.mutedText,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.light.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },

  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.secondaryText,
  },
});