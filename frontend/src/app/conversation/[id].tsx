import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';

import {
  apiRequest,
} from '../../services/api';

import {
  getHITLForConversation,
  isHITLActive,
  submitHITLRequest,
} from '../../services/hitl';

import {
  HITLRequest,
} from '../../types/hitl';

import {
  formatAIResponse,
} from '../../utils/responseFormatter';


/* ============================================================
   TYPES
   ============================================================ */

interface TimelineItem {
  title: string;
  description: string;
  status:
    | 'completed'
    | 'failed'
    | 'denied'
    | 'pending';
}

interface ConversationHITL {
  id: string;
  conversation_id: string;
  employee_id: string;
  reason: string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected';
  reviewed_by: string | null;
  review_comment: string | null;
  created_at: string;
  reviewed_at: string | null;
  execution_status:
    | 'executing'
    | 'successful'
    | 'failed'
    | null;
  execution_result:
    | Record<string, unknown>
    | null;
  executed_at: string | null;
}

interface ConversationResponseData {
  route?: string | null;
  data?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  employee_id: string;
  query: string;
  query_type: string;
  status: string;

  response?: ConversationResponseData;

  response_json?: ConversationResponseData;

  raw_result_json?: Record<string, unknown>;

  created_at: string;

  completed_at?: string | null;

  timeline?: TimelineItem[];

  hitl_request?: ConversationHITL | null;
}

interface ConversationResponse {
  status: string;
  conversation: Conversation;
}


/* ============================================================
   HELPERS
   ============================================================ */

function capitalize(
  value: string
): string {
  if (!value) {
    return '';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function getStatusLabel(
  status: string
): string {
  switch (status.toLowerCase()) {
    case 'successful':
      return 'Successful';

    case 'failed':
      return 'Failed';

    case 'denied':
      return 'Denied';

    case 'pending':
      return 'Pending';

    default:
      return status;
  }
}


function getStatusColor(
  status: string
): string {
  switch (status.toLowerCase()) {
    case 'successful':
      return Colors.light.success;

    case 'failed':
      return Colors.light.error;

    case 'denied':
      return Colors.light.error;

    case 'pending':
      return Colors.light.warning;

    default:
      return Colors.light.secondaryText;
  }
}


function getTimelineIcon(
  status: TimelineItem['status']
) {
  switch (status) {
    case 'completed':
      return 'checkmark-circle';

    case 'failed':
      return 'close-circle';

    case 'denied':
      return 'ban';

    case 'pending':
      return 'time';

    default:
      return 'ellipse';
  }
}


/*
 * Uses the shared formatter so the Conversation Details
 * screen displays the same human-readable response as
 * the New Request and History screens.
 */
function getReadableAIResponse(
  conversation: Conversation
): {
  title: string;
  message: string;
} {
  const response =
    conversation.response_json ??
    conversation.response;

  return formatAIResponse(
    response,
    conversation.query_type as any
  );
}


/*
 * Formats the result produced after a HITL request
 * has been manually approved and executed.
 */
function getReadableExecutionResult(
  executionResult:
    | Record<string, unknown>
    | null
): {
  title: string;
  message: string;
} | null {
  if (!executionResult) {
    return null;
  }

  /*
   * The backend stores:
   *
   * {
   *   route,
   *   response,
   *   route_result,
   *   raw_result,
   *   ...
   * }
   *
   * Prefer the human-readable response first.
   */
  if (
    executionResult.response !== undefined
  ) {
    return formatAIResponse(
      executionResult.response,
      'Action'
    );
  }

  if (
    executionResult.route_result !==
    undefined
  ) {
    return formatAIResponse(
      executionResult.route_result,
      'Action'
    );
  }

  return formatAIResponse(
    executionResult,
    'Action'
  );
}


/* ============================================================
   SCREEN
   ============================================================ */

export default function ConversationDetailsScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    conversation,
    setConversation,
  ] =
    useState<Conversation | null>(null);

  const [
    hitl,
    setHitl,
  ] =
    useState<HITLRequest | null>(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    reason,
    setReason,
  ] =
    useState('');

  const [
    showHITLModal,
    setShowHITLModal,
  ] =
    useState(false);


  /* ============================================================
     LOAD CONVERSATION
     ============================================================ */

  const loadConversation =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);

        const conversationResponse =
          await apiRequest<ConversationResponse>(
            `/api/conversations/${id}`
          );

        setConversation(
          conversationResponse.conversation
        );

        const conversationHITL =
          await getHITLForConversation(id);

        setHitl(
          conversationHITL
        );

      } catch (error) {
        Alert.alert(
          'Unable to load',
          error instanceof Error
            ? error.message
            : 'Unable to load conversation.'
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  useEffect(() => {
    loadConversation();
  }, [loadConversation]);


  /* ============================================================
     HITL SUBMISSION
     ============================================================ */

  const handleSubmitHITL =
    async () => {
      if (!conversation) {
        return;
      }

      const trimmedReason =
        reason.trim();

      if (!trimmedReason) {
        Alert.alert(
          'Reason required',
          'Please explain why this request should be reviewed by a human.'
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await submitHITLRequest(
            conversation.id,
            trimmedReason
          );

        setHitl(
          response.hitl_request
        );

        setReason('');

        setShowHITLModal(false);

        Alert.alert(
          'Submitted',
          'Your request has been submitted for human review.'
        );

      } catch (error) {
        Alert.alert(
          'Submission failed',
          error instanceof Error
            ? error.message
            : 'Unable to submit the request.'
        );

      } finally {
        setSubmitting(false);
      }
    };


  /* ============================================================
     LOADING / EMPTY
     ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        edges={['top']}
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              Colors.light.primary
            }
          />

          <Text
            style={styles.loadingText}
          >
            Loading conversation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  if (!conversation) {
    return (
      <SafeAreaView
        edges={['top']}
        style={styles.container}
      >
        <View
          style={
            styles.emptyContainer
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={48}
            color={
              Colors.light.mutedText
            }
          />

          <Text
            style={styles.emptyTitle}
          >
            Conversation not found
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }


  /* ============================================================
     FORMATTED DATA
     ============================================================ */

  const aiResponse =
    getReadableAIResponse(
      conversation
    );


  const executionResult =
    hitl?.execution_result
      ? getReadableExecutionResult(
          hitl.execution_result
        )
      : null;


  const activeHITL =
    isHITLActive(hitl);


  const canSubmitHITL =
    (
      conversation.status ===
        'failed' ||
      conversation.status ===
        'denied'
    ) &&
    !activeHITL;


  /* ============================================================
     UI
     ============================================================ */

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.container}
    >

      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={
              Colors.light.text
            }
          />
        </Pressable>

        <View
          style={styles.headerContent}
        >
          <Text
            style={styles.headerTitle}
          >
            Conversation Details
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Single-turn AI request
          </Text>
        </View>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ======================================================
           STATUS
           ====================================================== */}

        <View
          style={styles.statusCard}
        >
          <View>
            <Text
              style={styles.statusLabel}
            >
              Status
            </Text>

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    getStatusColor(
                      conversation.status
                    ),
                },
              ]}
            >
              {getStatusLabel(
                conversation.status
              )}
            </Text>
          </View>

          <View
            style={styles.statusIcon}
          >
            <Ionicons
              name={
                conversation.status ===
                'successful'
                  ? 'checkmark-circle'
                  : conversation.status ===
                    'denied'
                    ? 'ban'
                    : conversation.status ===
                      'failed'
                      ? 'close-circle'
                      : 'time'
              }
              size={28}
              color={
                getStatusColor(
                  conversation.status
                )
              }
            />
          </View>
        </View>


        {/* ======================================================
           USER REQUEST
           ====================================================== */}

        <View style={styles.card}>
          <View
            style={styles.sectionHeader}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={
                  Colors.light.primary
                }
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Your Request
            </Text>
          </View>

          <Text
            style={styles.queryText}
          >
            {conversation.query}
          </Text>
        </View>


        {/* ======================================================
           AI RESPONSE
           ====================================================== */}

        <View style={styles.card}>
          <View
            style={styles.sectionHeader}
          >
            <View
              style={styles.aiIcon}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={
                  Colors.light.primary
                }
              />
            </View>

            <View
              style={
                styles.responseHeaderContent
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                AI Response
              </Text>

              {aiResponse.title !==
                'AI Response' ? (
                <Text
                  style={
                    styles.responseHeaderTitle
                  }
                >
                  {aiResponse.title}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            style={styles.responseBox}
          >
            <Text
              style={styles.responseText}
            >
              {aiResponse.message}
            </Text>
          </View>
        </View>


        {/* ======================================================
           QUERY TYPE
           ====================================================== */}

        <View style={styles.infoRow}>
          <View>
            <Text
              style={styles.infoLabel}
            >
              Query Type
            </Text>

            <Text
              style={styles.infoValue}
            >
              {conversation.query_type}
            </Text>
          </View>

          <View
            style={styles.typeBadge}
          >
            <Text
              style={styles.typeBadgeText}
            >
              {conversation.query_type}
            </Text>
          </View>
        </View>


        {/* ======================================================
           AI PROCESSING TIMELINE
           ====================================================== */}

        <View style={styles.card}>
          <View
            style={styles.sectionHeader}
          >
            <View
              style={styles.sectionIcon}
            >
              <Ionicons
                name="git-branch-outline"
                size={18}
                color={
                  Colors.light.primary
                }
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Processing Timeline
            </Text>
          </View>

          {conversation.timeline &&
          conversation.timeline.length >
            0 ? (
            <View
              style={styles.timeline}
            >
              {conversation.timeline.map(
                (item, index) => (
                  <View
                    key={`${item.title}-${index}`}
                    style={
                      styles.timelineItem
                    }
                  >
                    <View
                      style={
                        styles.timelineLeft
                      }
                    >
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              item.status ===
                              'completed'
                                ? Colors.light
                                    .successLight
                                : item.status ===
                                  'denied'
                                  ? Colors.light
                                      .errorLight
                                  : item.status ===
                                    'failed'
                                    ? Colors.light
                                        .errorLight
                                    : Colors.light
                                        .warningLight,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            getTimelineIcon(
                              item.status
                            ) as any
                          }
                          size={16}
                          color={
                            item.status ===
                            'completed'
                              ? Colors.light
                                  .success
                              : item.status ===
                                'pending'
                                ? Colors.light
                                    .warning
                                : Colors.light
                                    .error
                          }
                        />
                      </View>

                      {index <
                      (
                        conversation.timeline
                          ?.length ?? 0
                      ) - 1 ? (
                        <View
                          style={
                            styles.timelineLine
                          }
                        />
                      ) : null}
                    </View>

                    <View
                      style={
                        styles.timelineContent
                      }
                    >
                      <Text
                        style={
                          styles.timelineTitle
                        }
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={
                          styles.timelineDescription
                        }
                      >
                        {item.description}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          ) : (
            <Text
              style={styles.mutedText}
            >
              Processing information is not available.
            </Text>
          )}
        </View>


        {/* ======================================================
           HITL STATUS
           ====================================================== */}

        {hitl ? (
          <View
            style={[
              styles.card,
              styles.hitlCard,
            ]}
          >
            <View
              style={styles.sectionHeader}
            >
              <View
                style={styles.hitlIcon}
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={
                    Colors.light.primary
                  }
                />
              </View>

              <Text
                style={styles.sectionTitle}
              >
                Human Review
              </Text>
            </View>

            <View
              style={styles.hitlStatusRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Review Status
              </Text>

              <View
                style={[
                  styles.hitlBadge,
                  {
                    backgroundColor:
                      hitl.status ===
                      'approved'
                        ? Colors.light
                            .successLight
                        : hitl.status ===
                          'rejected'
                          ? Colors.light
                              .errorLight
                          : Colors.light
                              .warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.hitlBadgeText,
                    {
                      color:
                        hitl.status ===
                        'approved'
                          ? Colors.light
                              .success
                          : hitl.status ===
                            'rejected'
                            ? Colors.light
                                .error
                            : Colors.light
                                .warning,
                    },
                  ]}
                >
                  {capitalize(
                    hitl.status
                  )}
                </Text>
              </View>
            </View>

            <Text
              style={styles.reasonLabel}
            >
              Your Reason
            </Text>

            <Text
              style={styles.reasonText}
            >
              {hitl.reason}
            </Text>

            {hitl.review_comment ? (
              <View
                style={styles.commentBox}
              >
                <Text
                  style={
                    styles.reasonLabel
                  }
                >
                  Administrator Comment
                </Text>

                <Text
                  style={
                    styles.reasonText
                  }
                >
                  {hitl.review_comment}
                </Text>
              </View>
            ) : null}


            {/* EXECUTION STATE */}

            {hitl.execution_status ? (
              <View
                style={
                  styles.executionState
                }
              >
                <Ionicons
                  name={
                    hitl.execution_status ===
                    'successful'
                      ? 'checkmark-circle'
                      : hitl.execution_status ===
                        'failed'
                        ? 'close-circle'
                        : 'sync-circle'
                  }
                  size={22}
                  color={
                    hitl.execution_status ===
                    'successful'
                      ? Colors.light.success
                      : hitl.execution_status ===
                        'failed'
                        ? Colors.light.error
                        : Colors.light.primary
                  }
                />

                <View
                  style={
                    styles.executionStateContent
                  }
                >
                  <Text
                    style={
                      styles.executionTitle
                    }
                  >
                    {hitl.execution_status ===
                    'successful'
                      ? 'Request Executed'
                      : hitl.execution_status ===
                        'failed'
                        ? 'Execution Failed'
                        : 'Execution In Progress'}
                  </Text>

                  {hitl.executed_at ? (
                    <Text
                      style={
                        styles.executionDate
                      }
                    >
                      {new Date(
                        hitl.executed_at
                      ).toLocaleString()}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}


        {/* ======================================================
           EXECUTION RESULT
           ====================================================== */}

        {hitl?.execution_status ===
          'successful' &&
        executionResult ? (
          <View
            style={[
              styles.card,
              styles.executionResultCard,
            ]}
          >
            <View
              style={styles.sectionHeader}
            >
              <View
                style={styles.successIcon}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={
                    Colors.light.success
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Execution Result
                </Text>

                <Text
                  style={
                    styles.resultSubtitle
                  }
                >
                  Manually approved and executed
                </Text>
              </View>
            </View>

            <View
              style={styles.resultBanner}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={
                  Colors.light.success
                }
              />

              <Text
                style={
                  styles.resultBannerText
                }
              >
                The approved request was successfully
                executed by the administrator.
              </Text>
            </View>

            <View
              style={
                styles.executionResultBox
              }
            >
              <Text
                style={
                  styles.executionResultTitle
                }
              >
                {executionResult.title}
              </Text>

              <Text
                style={
                  styles.executionResultText
                }
              >
                {executionResult.message}
              </Text>
            </View>
          </View>
        ) : null}


        {/* ======================================================
           EXECUTION FAILED
           ====================================================== */}

        {hitl?.execution_status ===
        'failed' ? (
          <View
            style={[
              styles.card,
              styles.failedExecutionCard,
            ]}
          >
            <View
              style={styles.sectionHeader}
            >
              <Ionicons
                name="alert-circle"
                size={22}
                color={
                  Colors.light.error
                }
              />

              <Text
                style={styles.sectionTitle}
              >
                Execution Failed
              </Text>
            </View>

            <Text
              style={styles.mutedText}
            >
              The administrator approved the request,
              but the approved operation could not be
              completed.
            </Text>

            {executionResult ? (
              <View
                style={
                  styles.executionResultBox
                }
              >
                <Text
                  style={
                    styles.executionResultTitle
                  }
                >
                  {executionResult.title}
                </Text>

                <Text
                  style={
                    styles.executionResultText
                  }
                >
                  {executionResult.message}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}


        {/* ======================================================
           ACTIVE HITL
           ====================================================== */}

        {activeHITL ? (
          <View
            style={
              styles.activeHITLBanner
            }
          >
            <Ionicons
              name="time-outline"
              size={22}
              color={
                Colors.light.warning
              }
            />

            <View
              style={
                styles.activeHITLContent
              }
            >
              <Text
                style={
                  styles.activeHITLTitle
                }
              >
                Human review is in progress
              </Text>

              <Text
                style={
                  styles.activeHITLText
                }
              >
                This request has already been submitted.
                You cannot submit it again while the
                current review is active.
              </Text>
            </View>
          </View>
        ) : null}


        {/* ======================================================
           SUBMIT HITL
           ====================================================== */}

        {canSubmitHITL ? (
          <Pressable
            style={
              styles.humanReviewButton
            }
            onPress={() =>
              setShowHITLModal(true)
            }
          >
            <View
              style={
                styles.humanReviewIcon
              }
            >
              <Ionicons
                name="people"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.buttonContent}
            >
              <Text
                style={
                  styles.humanReviewTitle
                }
              >
                Submit for Human Review
              </Text>

              <Text
                style={
                  styles.humanReviewSubtitle
                }
              >
                Ask an administrator to review this request
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        ) : null}


        <View
          style={styles.bottomSpace}
        />

      </ScrollView>


      {/* ========================================================
         HITL MODAL
         ======================================================== */}

      <Modal
        visible={showHITLModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowHITLModal(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContainer}
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={styles.modalTitle}
                >
                  Submit for Human Review
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Tell the administrator why this request
                  needs human attention.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowHITLModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    Colors.light
                      .secondaryText
                  }
                />
              </Pressable>
            </View>

            <Text
              style={styles.modalLabel}
            >
              Original Request
            </Text>

            <View
              style={styles.modalQueryBox}
            >
              <Text
                style={
                  styles.modalQueryText
                }
              >
                {conversation.query}
              </Text>
            </View>

            <Text
              style={styles.modalLabel}
            >
              Reason
            </Text>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Explain why this request should be reviewed..."
              placeholderTextColor={
                Colors.light.mutedText
              }
              multiline
              textAlignVertical="top"
              maxLength={1000}
              style={styles.reasonInput}
            />

            <Text
              style={styles.characterCount}
            >
              {reason.length}/1000
            </Text>

            <Pressable
              style={[
                styles.submitButton,
                submitting &&
                  styles.disabledButton,
              ]}
              disabled={submitting}
              onPress={
                handleSubmitHITL
              }
            >
              {submitting ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.submitButtonText
                    }
                  >
                    Submit to Human Review
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}


/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color:
      Colors.light.secondaryText,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor:
      Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor:
      Colors.light.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.surfaceSecondary,
  },

  headerContent: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color:
      Colors.light.secondaryText,
  },

  scrollContent: {
    padding: 16,
  },

  statusCard: {
    backgroundColor:
      Colors.light.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  statusLabel: {
    fontSize: 12,
    color:
      Colors.light.secondaryText,
    marginBottom: 4,
  },

  statusText: {
    fontSize: 20,
    fontWeight: '800',
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.surfaceSecondary,
  },

  card: {
    backgroundColor:
      Colors.light.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.primaryLight,
    marginRight: 10,
  },

  aiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.primaryLight,
    marginRight: 10,
  },

  hitlIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.primaryLight,
    marginRight: 10,
  },

  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.successLight,
    marginRight: 10,
  },

  responseHeaderContent: {
    flex: 1,
  },

  responseHeaderTitle: {
    marginTop: 2,
    fontSize: 11,
    color:
      Colors.light.secondaryText,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },

  queryText: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
  },

  responseBox: {
    backgroundColor:
      Colors.light.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },

  responseText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.text,
  },

  mutedText: {
    fontSize: 14,
    lineHeight: 21,
    color:
      Colors.light.secondaryText,
  },

  infoRow: {
    backgroundColor:
      Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 12,
    color:
      Colors.light.secondaryText,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor:
      Colors.light.primaryLight,
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color:
      Colors.light.primary,
  },

  timeline: {
    marginTop: 4,
  },

  timelineItem: {
    flexDirection: 'row',
  },

  timelineLeft: {
    width: 34,
    alignItems: 'center',
  },

  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor:
      Colors.light.border,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 22,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },

  timelineDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color:
      Colors.light.secondaryText,
  },

  hitlCard: {
    borderColor:
      Colors.light.primaryLight,
  },

  hitlStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  hitlBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  hitlBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color:
      Colors.light.secondaryText,
    marginBottom: 6,
  },

  reasonText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.text,
  },

  commentBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor:
      Colors.light.border,
  },

  executionState: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor:
      Colors.light.surfaceSecondary,
  },

  executionStateContent: {
    flex: 1,
  },

  executionTitle: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },

  executionDate: {
    marginLeft: 10,
    marginTop: 3,
    fontSize: 11,
    color:
      Colors.light.secondaryText,
  },

  executionResultCard: {
    borderColor:
      Colors.light.successLight,
  },

  resultSubtitle: {
    marginTop: 2,
    marginLeft: 44,
    fontSize: 11,
    color:
      Colors.light.secondaryText,
  },

  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 12,
    backgroundColor:
      Colors.light.successLight,
    marginBottom: 14,
  },

  resultBannerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
    color:
      Colors.light.success,
    fontWeight: '600',
  },

  executionResultBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor:
      Colors.light.surfaceSecondary,
  },

  executionResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 7,
  },

  executionResultText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.text,
  },

  failedExecutionCard: {
    borderColor:
      Colors.light.errorLight,
  },

  activeHITLBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor:
      Colors.light.warningLight,
  },

  activeHITLContent: {
    flex: 1,
    marginLeft: 10,
  },

  activeHITLTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },

  activeHITLText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color:
      Colors.light.secondaryText,
  },

  humanReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      Colors.light.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 2,
  },

  humanReviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      Colors.light.primaryDark,
  },

  buttonContent: {
    flex: 1,
    marginLeft: 12,
  },

  humanReviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  humanReviewSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.85,
  },

  primaryButton: {
    backgroundColor:
      Colors.light.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  bottomSpace: {
    height: 40,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    backgroundColor:
      Colors.light.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.light.text,
  },

  modalSubtitle: {
    marginTop: 5,
    maxWidth: 310,
    fontSize: 12,
    lineHeight: 18,
    color:
      Colors.light.secondaryText,
  },

  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },

  modalQueryBox: {
    backgroundColor:
      Colors.light.surfaceSecondary,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
  },

  modalQueryText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.text,
  },

  reasonInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    borderRadius: 12,
    padding: 13,
    fontSize: 14,
    color: Colors.light.text,
    backgroundColor:
      Colors.light.surface,
  },

  characterCount: {
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 14,
    fontSize: 11,
    color:
      Colors.light.mutedText,
  },

  submitButton: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor:
      Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});