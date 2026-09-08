import React, {
  useCallback,
  useState,
} from 'react';

import { formatAIResponse } from '../utils/responseFormatter';

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

import ScreenContainer from '../components/common/ScreenContainer';

import {
  getConversations,
} from '../services/conversations';

import {
  ConversationSummary,
} from '../types/conversation';

import { Colors } from '../constants/colors';


function formatDate(
  dateString: string
): string {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}


function getStatusColor(
  status: string
): string {
  switch (status) {
    case 'successful':
      return '#16A34A';

    case 'failed':
      return '#DC2626';

    case 'denied':
      return '#D97706';

    case 'pending':
      return '#2563EB';

    default:
      return '#6B7280';
  }
}


/*
 * Extract a human-readable AI response.
 *
 * Backend structure:
 *
 * response_json
 * ├── route
 * └── data
 *     ├── type
 *     ├── title
 *     ├── summary
 *     └── content[]
 *
 * We intentionally do NOT display the
 * raw JSON object.
 */

function getAIResponse(
  item: ConversationSummary
): {
  title: string;
  response: string;
} {
  const response =
    item.response_json ??
    item.response;

  const formatted =
    formatAIResponse(
      response,
      item.query_type
    );

  return {
    title: formatted.title,
    response: formatted.message,
  };
}

function ConversationItem({
  item,
  onPress,
}: {
  item: ConversationSummary;
  onPress: () => void;
}) {

  const aiResponse =
    getAIResponse(item);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onPress}
    >

      <View style={styles.cardTop}>

        <View style={styles.typeContainer}>
          <Text style={styles.queryType}>
            {item.query_type}
          </Text>
        </View>

        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor:
                `${getStatusColor(item.status)}15`,
            },
          ]}
        >

          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  getStatusColor(item.status),
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  getStatusColor(item.status),
              },
            ]}
          >
            {item.status}
          </Text>

        </View>

      </View>


      {/* User query */}

      <Text style={styles.queryLabel}>
        Your request
      </Text>

      <Text
        style={styles.query}
        numberOfLines={2}
      >
        {item.query}
      </Text>


      {/* AI response */}

      <View style={styles.responseSection}>

        <Text style={styles.responseLabel}>
          AI Response
        </Text>

        <Text
          style={styles.responseTitle}
          numberOfLines={1}
        >
          {aiResponse.title}
        </Text>

        <Text
          style={styles.response}
          numberOfLines={3}
        >
          {aiResponse.response}
        </Text>

      </View>


      <Text style={styles.date}>
        {formatDate(item.created_at)}
      </Text>

    </TouchableOpacity>
  );
}


export default function HistoryScreen() {

  const router = useRouter();

  const [
    conversations,
    setConversations,
  ] = useState<ConversationSummary[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const loadConversations =
    useCallback(async () => {

      try {

        setError(null);

        const result =
          await getConversations();

        setConversations(
          result.conversations
        );

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load conversation history.'
        );

      } finally {

        setLoading(false);

      }

    }, []);


  useFocusEffect(
    useCallback(() => {

      loadConversations();

    }, [loadConversations])
  );


  const handleRefresh =
    async () => {

      setRefreshing(true);

      await loadConversations();

      setRefreshing(false);

    };


  if (loading) {

    return (
      <ScreenContainer>

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
          />

          <Text style={styles.loadingText}>
            Loading history...
          </Text>

        </View>

      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>

      <View style={styles.container}>

        <View style={styles.header}>

          <Text style={styles.title}>
            History
          </Text>

          <Text style={styles.subtitle}>
            Your previous IT requests
          </Text>

        </View>


        {error ? (

          <View style={styles.errorCard}>

            <Text style={styles.errorTitle}>
              Unable to load history
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadConversations}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </TouchableOpacity>

          </View>

        ) : conversations.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyTitle}>
              No requests yet
            </Text>

            <Text style={styles.emptyText}>
              Your completed IT requests will
              appear here.
            </Text>

            <TouchableOpacity
              style={styles.newRequestButton}
              onPress={() =>
                router.push('/new-request')
              }
            >
              <Text
                style={
                  styles.newRequestButtonText
                }
              >
                New Request
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (

              <ConversationItem
                item={item}
                onPress={() =>
                  router.push(
                    `/conversation/${item.id}`
                  )
                }
              />

            )}
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
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

  header: {
    paddingTop: 12,
    paddingBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.light.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: Colors.light.secondaryText,
  },

  listContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor:
      Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  typeContainer: {
    backgroundColor:
      Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  queryType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  queryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.secondaryText,
    marginBottom: 4,
  },

  query: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.light.text,
  },

  responseSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      Colors.light.border,
  },

  responseLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.secondaryText,
    marginBottom: 5,
  },

  responseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },

  response: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.secondaryText,
  },

  date: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.secondaryText,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.secondaryText,
  },

  newRequestButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor:
      Colors.light.primary,
  },

  newRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  errorCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    backgroundColor:
      Colors.light.card,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.secondaryText,
  },

  retryButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor:
      Colors.light.primary,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

});