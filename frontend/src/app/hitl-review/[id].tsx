import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../../components/common/ScreenContainer';

import { Colors } from '../../constants/colors';

import {
  executeHITLRequest,
  getAdminHITLRequest,
  reviewHITLRequest,
} from '../../services/hitl';

import {
  apiRequest,
} from '../../services/api';

import {
  HITLRequest,
} from '../../types/hitl';

import {
  ConversationDetails,
} from '../../types/conversation';


interface ConversationResponse {
  status: string;
  conversation: ConversationDetails;
}


export default function HITLReviewScreen() {

  const router = useRouter();

  const {
    id,
  } = useLocalSearchParams<{
    id: string;
  }>();

  const [request, setRequest] =
    useState<HITLRequest | null>(null);

  const [conversation, setConversation] =
    useState<ConversationDetails | null>(null);

  const [comment, setComment] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [reviewing, setReviewing] =
    useState(false);

  const [executing, setExecuting] =
    useState(false);


  const loadRequest = async () => {

    if (!id) {
      return;
    }

    try {

      setLoading(true);

      const hitlResponse =
        await getAdminHITLRequest(id);

      const hitlRequest =
        hitlResponse.hitl_request;

      setRequest(hitlRequest);


      /*
       * Fetch the original conversation.
       *
       * This gives the admin the actual:
       * - user query
       * - AI response
       * - query type
       * - original AI status
       * - timeline
       */

      const conversationResponse =
        await apiRequest<ConversationResponse>(
          `/api/conversations/${hitlRequest.conversation_id}`
        );

      setConversation(
        conversationResponse.conversation
      );

    } catch (error) {

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Unable to load HITL request.'
      );

    } finally {

      setLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [id])
  );


  const handleReview = (
    status: 'approved' | 'rejected'
  ) => {

    if (!id) {
      return;
    }

    const action =
      status === 'approved'
        ? 'approve'
        : 'reject';

    Alert.alert(
      `${action.charAt(0).toUpperCase()}${action.slice(1)} Request`,
      `Are you sure you want to ${action} this request?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text:
            action === 'approve'
              ? 'Approve'
              : 'Reject',

          style:
            action === 'reject'
              ? 'destructive'
              : 'default',

          onPress: async () => {

            try {

              setReviewing(true);

              const response =
                await reviewHITLRequest(
                  id,
                  status,
                  comment.trim()
                    || undefined
                );

              setRequest(
                response.hitl_request
              );

              Alert.alert(
                'Success',
                status === 'approved'
                  ? 'Request approved. You can now execute the request.'
                  : 'Request rejected.',
              );

            } catch (error) {

              Alert.alert(
                'Review failed',
                error instanceof Error
                  ? error.message
                  : 'Unable to review request.'
              );

            } finally {

              setReviewing(false);
            }
          },
        },
      ]
    );
  };


  const handleExecute = () => {

    if (!id) {
      return;
    }

    Alert.alert(
      'Execute Request',
      'This will send the original request through the AI operations system again. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Execute',
          onPress: async () => {

            try {

              setExecuting(true);

              const response =
                await executeHITLRequest(id);

              setRequest(
                response.hitl_request
              );

              if (
                response.hitl_request
                  .execution_status ===
                'successful'
              ) {

                Alert.alert(
                  'Execution Successful',
                  'The approved request was executed successfully.'
                );

              } else {

                Alert.alert(
                  'Execution Failed',
                  'The request was approved, but execution failed.'
                );
              }

            } catch (error) {

              Alert.alert(
                'Execution Failed',
                error instanceof Error
                  ? error.message
                  : 'Unable to execute request.'
              );

            } finally {

              setExecuting(false);
            }
          },
        },
      ]
    );
  };


  if (loading) {

    return (
      <ScreenContainer>

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
          />

          <Text style={styles.loadingText}>
            Loading review request...
          </Text>

        </View>

      </ScreenContainer>
    );
  }


  if (!request) {

    return (
      <ScreenContainer>

        <View style={styles.center}>

          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.light.error}
          />

          <Text style={styles.errorTitle}>
            Request not found
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>

        </View>

      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer
      edges={[
        'top',
        'bottom',
      ]}
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={Colors.light.text}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>

            <Text style={styles.eyebrow}>
              ADMIN REVIEW
            </Text>

            <Text style={styles.title}>
              Review Request
            </Text>

          </View>

        </View>


        {/* REVIEW STATUS */}

        <View style={styles.statusBanner}>

          <View style={styles.statusIcon}>

            <Ionicons
              name={
                request.status === 'pending'
                  ? 'time-outline'
                  : request.status === 'approved'
                    ? 'checkmark-circle-outline'
                    : 'close-circle-outline'
              }
              size={24}
              color={
                request.status === 'pending'
                  ? Colors.light.warning
                  : request.status === 'approved'
                    ? Colors.light.success
                    : Colors.light.error
              }
            />

          </View>

          <View style={styles.statusBannerText}>

            <Text style={styles.statusBannerTitle}>
              {request.status === 'pending'
                ? 'Human review required'
                : request.status === 'approved'
                  ? 'Request approved'
                  : 'Request rejected'}
            </Text>

            <Text style={styles.statusBannerDescription}>
              {request.status === 'pending'
                ? 'Review the original request and AI decision before taking action.'
                : request.status === 'approved'
                  ? 'The request can now be executed.'
                  : 'This request has been rejected by an administrator.'}
            </Text>

          </View>

        </View>


        {/* USER REQUEST */}

        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.light.primary}
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                User Request
              </Text>

              <Text style={styles.sectionSubtitle}>
                What the employee asked for
              </Text>

            </View>

          </View>


          <View style={styles.queryBox}>

            <Text style={styles.queryText}>
              {conversation?.query
                || 'Original user request is unavailable.'}
            </Text>

          </View>

        </View>


        {/* AI RESPONSE */}

        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>

            <View style={styles.aiIcon}>

              <Ionicons
                name="sparkles-outline"
                size={20}
                color={Colors.light.primary}
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                AI Response
              </Text>

              <Text style={styles.sectionSubtitle}>
                What the AI decided or returned
              </Text>

            </View>

          </View>


          <View style={styles.aiResponseBox}>

            <Text style={styles.aiResponseText}>
              {formatConversationResponse(
                conversation?.response
              )}
            </Text>

          </View>

        </View>


        {/* REQUEST CONTEXT */}

        <View style={styles.sectionCard}>

          <Text style={styles.sectionTitle}>
            Request Context
          </Text>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="person-circle-outline"
                size={20}
                color={Colors.light.secondaryText}
              />

            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                Employee
              </Text>

              <Text style={styles.infoValue}>
                {request.employee_id}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="git-branch-outline"
                size={20}
                color={Colors.light.secondaryText}
              />

            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                Query Type
              </Text>

              <Text style={styles.infoValue}>
                {conversation?.query_type
                  || 'Unknown'}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={Colors.light.secondaryText}
              />

            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                Original AI Status
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      getStatusColor(
                        conversation?.status
                      ),
                  },
                ]}
              >
                {(
                  conversation?.status
                  || 'unknown'
                ).toUpperCase()}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.light.secondaryText}
              />

            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                Submitted
              </Text>

              <Text style={styles.infoValue}>
                {new Date(
                  request.created_at
                ).toLocaleString()}
              </Text>

            </View>

          </View>

        </View>


        {/* REQUESTER REASON */}

        <View style={styles.reasonCard}>

          <View style={styles.sectionHeader}>

            <View style={styles.reasonIcon}>

              <Ionicons
                name="chatbox-ellipses-outline"
                size={20}
                color={Colors.light.warning}
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                Requester's Reason
              </Text>

              <Text style={styles.sectionSubtitle}>
                Why human review was requested
              </Text>

            </View>

          </View>


          <Text style={styles.reasonText}>
            {request.reason}
          </Text>

        </View>


        {/* AI TIMELINE */}

        {conversation?.timeline &&
          conversation.timeline.length > 0 && (

            <View style={styles.sectionCard}>

              <View style={styles.sectionHeader}>

                <View style={styles.timelineIcon}>

                  <Ionicons
                    name="git-network-outline"
                    size={20}
                    color={Colors.light.primary}
                  />

                </View>

                <View>

                  <Text style={styles.sectionTitle}>
                    AI Processing
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    What happened before human review
                  </Text>

                </View>

              </View>


              <View style={styles.timeline}>

                {conversation.timeline.map(
                  (item, index) => (

                    <View
                      key={`${item.title}-${index}`}
                      style={styles.timelineItem}
                    >

                      <View style={styles.timelineRail}>

                        <View
                          style={[
                            styles.timelineDot,
                            item.status === 'failed' &&
                              styles.timelineDotFailed,
                            item.status === 'denied' &&
                              styles.timelineDotDenied,
                          ]}
                        />

                        {index <
                          conversation.timeline!.length - 1 && (
                          <View
                            style={styles.timelineLine}
                          />
                        )}

                      </View>

                      <View
                        style={styles.timelineContent}
                      >

                        <Text style={styles.timelineTitle}>
                          {item.title}
                        </Text>

                        <Text style={styles.timelineDescription}>
                          {item.description}
                        </Text>

                      </View>

                    </View>

                  )
                )}

              </View>

            </View>

          )}


        {/* ADMIN REVIEW */}

        {request.status === 'pending' && (

          <View style={styles.reviewCard}>

            <View style={styles.sectionHeader}>

              <View style={styles.reviewIcon}>

                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color={Colors.light.primary}
                />

              </View>

              <View>

                <Text style={styles.sectionTitle}>
                  Administrator Decision
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Decide how this request should proceed
                </Text>

              </View>

            </View>


            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a review comment..."
              placeholderTextColor={
                Colors.light.mutedText
              }
              multiline
              textAlignVertical="top"
              style={styles.input}
              editable={!reviewing}
            />


            <TouchableOpacity
              style={[
                styles.approveButton,
                reviewing &&
                  styles.disabled,
              ]}
              disabled={reviewing}
              onPress={() =>
                handleReview(
                  'approved'
                )
              }
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                {reviewing
                  ? 'Processing...'
                  : 'Approve Request'}
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.rejectButton,
                reviewing &&
                  styles.disabled,
              ]}
              disabled={reviewing}
              onPress={() =>
                handleReview(
                  'rejected'
                )
              }
            >

              <Ionicons
                name="close-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Reject Request
              </Text>

            </TouchableOpacity>

          </View>
        )}


        {/* APPROVED / EXECUTION */}

        {request.status === 'approved' && (

          <View style={styles.executionCard}>

            <View style={styles.sectionHeader}>

              <View style={styles.executionIcon}>

                <Ionicons
                  name="play-circle-outline"
                  size={22}
                  color={Colors.light.success}
                />

              </View>

              <View>

                <Text style={styles.sectionTitle}>
                  Execute Approved Request
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Run the approved operation
                </Text>

              </View>

            </View>


            <Text style={styles.executionText}>
              This request has been approved by an administrator.
              The original request will be sent through the AI
              operations system again.
            </Text>


            <Text style={styles.infoLabel}>
              Execution Status
            </Text>

            <Text style={styles.executionStatus}>
              {(
                request.execution_status
                || 'Not executed'
              ).toUpperCase()}
            </Text>


            {!request.execution_status ||
            request.execution_status === 'failed' ? (

              <TouchableOpacity
                style={[
                  styles.executeButton,
                  executing &&
                    styles.disabled,
                ]}
                disabled={executing}
                onPress={
                  handleExecute
                }
              >

                <Ionicons
                  name="play"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  {executing
                    ? 'Executing...'
                    : 'Execute Approved Request'}
                </Text>

              </TouchableOpacity>

            ) : null}


            {request.executed_at && (

              <Text style={styles.executedAt}>
                Executed:{' '}
                {new Date(
                  request.executed_at
                ).toLocaleString()}
              </Text>

            )}

          </View>
        )}


        {/* REJECTED */}

        {request.status === 'rejected' && (

          <View style={styles.rejectedCard}>

            <View style={styles.sectionHeader}>

              <View style={styles.rejectedIcon}>

                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color={Colors.light.error}
                />

              </View>

              <View>

                <Text style={styles.sectionTitle}>
                  Review Result
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Administrator decision
                </Text>

              </View>

            </View>


            <Text style={styles.reasonText}>
              This request was rejected.
            </Text>


            <Text style={styles.infoLabel}>
              Review Comment
            </Text>

            <Text style={styles.reasonText}>
              {request.review_comment
                || 'No comment provided.'}
            </Text>

          </View>
        )}


        {/* EXECUTION RESULT */}

        {request.execution_result && (

          <View style={styles.sectionCard}>

            <View style={styles.sectionHeader}>

              <View style={styles.executionResultIcon}>

                <Ionicons
                  name={
                    request.execution_status ===
                    'successful'
                      ? 'checkmark-circle-outline'
                      : 'alert-circle-outline'
                  }
                  size={22}
                  color={
                    request.execution_status ===
                    'successful'
                      ? Colors.light.success
                      : Colors.light.error
                  }
                />

              </View>

              <Text style={styles.sectionTitle}>
                Execution Result
              </Text>

            </View>


            <Text style={styles.resultText}>
              {request.execution_status ===
              'successful'
                ? 'Request completed successfully.'
                : 'Request execution failed.'}
            </Text>

          </View>
        )}

      </ScrollView>

    </ScreenContainer>
  );
}


/*
 * Convert the backend conversation response
 * into readable text for the administrator.
 */

function formatConversationResponse(
  response:
    | ConversationDetails['response']
    | undefined
): string {

  if (!response) {
    return 'AI response is unavailable.';
  }

  const data = response.data;


  /*
   * Jira / DB response:
   *
   * data: [
   *   {
   *     tool: "...",
   *     result: {
   *       jira_account: {...}
   *     }
   *   }
   * ]
   */

  if (Array.isArray(data)) {

    const firstItem = data[0];

    if (
      typeof firstItem === 'object' &&
      firstItem !== null
    ) {

      const item =
        firstItem as Record<string, unknown>;

      const result =
        item.result;

      if (
        typeof result === 'object' &&
        result !== null
      ) {

        const resultObject =
          result as Record<string, unknown>;

        const jiraAccount =
          resultObject.jira_account;

        if (
          typeof jiraAccount === 'object' &&
          jiraAccount !== null
        ) {

          const account =
            jiraAccount as Record<string, unknown>;

          const lines = [
            'Jira Account Information',
            '',
            `Jira Account ID: ${account.jira_account_id ?? 'N/A'}`,
            `Employee ID: ${account.employee_id ?? 'N/A'}`,
            `Jira Email: ${account.jira_email ?? 'N/A'}`,
            `Display Name: ${account.jira_display_name ?? 'N/A'}`,
            `Jira Role: ${account.jira_role ?? 'N/A'}`,
            `Access Level: ${account.jira_access_level ?? 'N/A'}`,
            `Status: ${account.jira_status ?? 'N/A'}`,
          ];

          const projectRoles =
            account.jira_project_roles;

          if (
            typeof projectRoles === 'object' &&
            projectRoles !== null
          ) {

            const entries =
              Object.entries(
                projectRoles as Record<
                  string,
                  unknown
                >
              );

            if (entries.length > 0) {

              lines.push('');
              lines.push('Project Roles:');

              entries.forEach(
                ([project, role]) => {
                  lines.push(
                    `${project}: ${String(role)}`
                  );
                }
              );
            }
          }

          return lines.join('\n');
        }


        /*
         * Generic tool result.
         */

        return formatValue(resultObject);
      }
    }

    if (data.length > 0) {
      return data
        .map((item) =>
          formatValue(item)
        )
        .join('\n\n');
    }
  }

  if (
    typeof data === 'object' &&
    data !== null
  ) {

    const record =
      data as Record<string, unknown>;

    const possibleFields = [
      'answer',
      'response',
      'content',
      'message',
      'result',
      'text',
    ];

    for (
      const field of possibleFields
    ) {

      if (
        typeof record[field] === 'string' &&
        record[field]
      ) {
        return record[field] as string;
      }
    }

    return formatValue(record);
  }


  return 'AI response is unavailable.';
}


function formatValue(
  value: unknown
): string {

  if (
    typeof value === 'string'
  ) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return 'No information available.';
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(
        (item) =>
          formatValue(item)
      )
      .join('\n');
  }

  if (
    typeof value === 'object'
  ) {

    return Object.entries(
      value as Record<
        string,
        unknown
      >
    )
      .map(
        ([key, item]) =>
          `${formatLabel(key)}: ${formatValue(item)}`
      )
      .join('\n');
  }

  return String(value);
}


function formatLabel(
  value: string
): string {

  return value
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}


function getStatusColor(
  status:
    | string
    | undefined
) {

  switch (status) {

    case 'successful':
      return Colors.light.success;

    case 'failed':
      return Colors.light.error;

    case 'denied':
      return Colors.light.warning;

    case 'pending':
      return Colors.light.warning;

    default:
      return Colors.light.secondaryText;
  }
}


const styles = StyleSheet.create({

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: Colors.light.secondaryText,
    fontSize: 14,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.light.primary,
    marginBottom: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    marginRight: 12,
  },

  statusBannerText: {
    flex: 1,
  },

  statusBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },

  statusBannerDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.secondaryText,
  },

  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    marginRight: 12,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.infoLight,
    marginRight: 12,
  },

  reasonIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.warningLight,
    marginRight: 12,
  },

  timelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    marginRight: 12,
  },

  reviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    marginRight: 12,
  },

  executionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.successLight,
    marginRight: 12,
  },

  rejectedIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.errorLight,
    marginRight: 12,
  },

  executionResultIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  queryBox: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 14,
    padding: 15,
  },

  queryText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
    fontWeight: '500',
  },

  aiResponseBox: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 14,
    padding: 15,
  },

  aiResponseText: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  infoIcon: {
    width: 36,
    alignItems: 'center',
    marginRight: 8,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.secondaryText,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },

  reasonCard: {
    backgroundColor: Colors.light.warningLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.warning,
    marginBottom: 16,
  },

  reasonText: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
  },

  timeline: {
    marginTop: 2,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 68,
  },

  timelineRail: {
    width: 30,
    alignItems: 'center',
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: Colors.light.success,
  },

  timelineDotFailed: {
    backgroundColor: Colors.light.error,
  },

  timelineDotDenied: {
    backgroundColor: Colors.light.warning,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: Colors.light.border,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 18,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },

  timelineDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.secondaryText,
  },

  reviewCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginBottom: 16,
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 13,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },

  approveButton: {
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.light.success,
  },

  rejectButton: {
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.light.error,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  disabled: {
    opacity: 0.5,
  },

  executionCard: {
    backgroundColor: Colors.light.successLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.success,
    marginBottom: 16,
  },

  executionText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.secondaryText,
    marginBottom: 14,
  },

  executionStatus: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.success,
  },

  executeButton: {
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.light.primary,
  },

  executedAt: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.light.secondaryText,
  },

  rejectedCard: {
    backgroundColor: Colors.light.errorLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.error,
    marginBottom: 16,
  },

  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
  },
});