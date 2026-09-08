import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import ScreenContainer from '../components/ui/ScreenContainer';
import { Colors } from '../constants/colors';
import { submitRequest } from '../services/chat';
import type { ChatResponse } from '../services/chat';
import { formatAIResponse } from '../utils/responseFormatter';


// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function extractResponse(
  response: ChatResponse
): {
  title: string;
  message: string;
} {
  return formatAIResponse(
  response.response,
  response.query_type as
    | 'RAG'
    | 'Action'
    | 'System Information'
    | 'Other'
);
}


// ---------------------------------------------------------
// Screen
// ---------------------------------------------------------

export default function NewRequestScreen() {
  const router = useRouter();

  const scrollViewRef =
    useRef<ScrollView>(null);

  const [query, setQuery] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<ChatResponse | null>(null);

  const [submittedQuery, setSubmittedQuery] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({
      animated: true,
    });
  }, [result, loading, error]);


  const handleSubmit = async () => {
    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      Alert.alert(
        'Enter a request',
        'Please describe your IT request before submitting.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Preserve the original request.
    setSubmittedQuery(trimmedQuery);

    try {
      const response =
        await submitRequest(trimmedQuery);

      console.log(
        'FULL CHAT RESPONSE:',
        JSON.stringify(
          response,
          null,
          2
        )
      );

      setResult(response);

    } catch (err) {
      console.error(
        'Chat request failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to process your request.'
      );

    } finally {
      setLoading(false);
    }
  };


  const handleNewRequest = () => {
    setQuery('');
    setSubmittedQuery('');
    setResult(null);
    setError(null);
  };


  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case 'successful':
      case 'success':
        return 'Successful';

      case 'failed':
        return 'Failed';

      case 'denied':
        return 'Denied';

      case 'pending':
        return 'Pending';

      case 'no_result':
        return 'No Result';

      default:
        return status;
    }
  };


  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case 'successful':
      case 'success':
        return {
          backgroundColor:
            Colors.light.successLight,
          color:
            Colors.light.success,
        };

      case 'failed':
        return {
          backgroundColor:
            Colors.light.errorLight,
          color:
            Colors.light.error,
        };

      case 'denied':
        return {
          backgroundColor:
            Colors.light.warningLight,
          color:
            Colors.light.warning,
        };

      case 'pending':
        return {
          backgroundColor:
            Colors.light.warningLight,
          color:
            Colors.light.warning,
        };

      default:
        return {
          backgroundColor:
            Colors.light.infoLight,
          color:
            Colors.light.info,
        };
    }
  };


  /*
   * Format the response only once.
   *
   * This is important because the formatter
   * returns an object containing:
   *
   * {
   *   title,
   *   message
   * }
   *
   * We must render message, not the object itself.
   */
  const formattedResponse =
    result
      ? extractResponse(result)
      : null;


  return (
    <ScreenContainer
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.container}>

          {/* Header */}

          <View style={styles.header}>

            <View>
              <Text style={styles.eyebrow}>
                AI OPERATIONS ASSISTANT
              </Text>

              <Text style={styles.title}>
                IT Assistant
              </Text>
            </View>

            {result && (
              <Pressable
                onPress={
                  handleNewRequest
                }
                style={
                  styles.headerButton
                }
              >
                <Text
                  style={
                    styles.headerButtonText
                  }
                >
                  New Request
                </Text>
              </Pressable>
            )}

          </View>


          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >

            {/* Empty State */}

            {!result &&
              !loading &&
              !error && (
                <View
                  style={
                    styles.welcomeContainer
                  }
                >

                  <View
                    style={
                      styles.aiIcon
                    }
                  >
                    <Text
                      style={
                        styles.aiIconText
                      }
                    >
                      ✦
                    </Text>
                  </View>


                  <Text
                    style={
                      styles.welcomeTitle
                    }
                  >
                    How can I help you today?
                  </Text>


                  <Text
                    style={
                      styles.welcomeSubtitle
                    }
                  >
                    Describe your IT request
                    naturally. The AI will
                    investigate and handle it
                    when possible.
                  </Text>


                  <Pressable
                    onPress={() =>
                      router.push(
                        '/instructions'
                      )
                    }
                    style={
                      styles.tipCard
                    }
                  >

                    <Text
                      style={
                        styles.tipIcon
                      }
                    >
                      💡
                    </Text>


                    <View
                      style={
                        styles.tipContent
                      }
                    >

                      <Text
                        style={
                          styles.tipTitle
                        }
                      >
                        Tip for better results
                      </Text>


                      <Text
                        style={
                          styles.tipText
                        }
                      >
                        Include the system,
                        project, reason, and
                        relevant details in
                        your request.
                      </Text>


                      <Text
                        style={
                          styles.instructionsLink
                        }
                      >
                        Read the Instructions →
                      </Text>

                    </View>

                  </Pressable>

                </View>
              )}


            {/* User Query */}

            {(result || loading) && (
              <View
                style={
                  styles.userMessageContainer
                }
              >

                <Text
                  style={
                    styles.userMessageLabel
                  }
                >
                  YOU
                </Text>


                <View
                  style={
                    styles.userBubble
                  }
                >
                  <Text
                    style={
                      styles.userText
                    }
                  >
                    {submittedQuery}
                  </Text>
                </View>

              </View>
            )}


            {/* AI Processing */}

            {loading && (
              <View
                style={
                  styles.aiCard
                }
              >

                <View
                  style={
                    styles.aiCardHeader
                  }
                >

                  <View
                    style={
                      styles.aiAvatar
                    }
                  >
                    <Text
                      style={
                        styles.aiAvatarText
                      }
                    >
                      AI
                    </Text>
                  </View>


                  <View>
                    <Text
                      style={
                        styles.aiName
                      }
                    >
                      IT Assistant
                    </Text>

                    <Text
                      style={
                        styles.processingText
                      }
                    >
                      Analyzing your request...
                    </Text>
                  </View>

                </View>


                <View
                  style={
                    styles.processingRow
                  }
                >

                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.light.primary
                    }
                  />

                  <Text
                    style={
                      styles.processingMessage
                    }
                  >
                    Investigating relevant
                    information and preparing
                    a response
                  </Text>

                </View>

              </View>
            )}


            {/* Error */}

            {error && (
              <View
                style={
                  styles.errorCard
                }
              >

                <Text
                  style={
                    styles.errorTitle
                  }
                >
                  Unable to process request
                </Text>


                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>


                <Pressable
                  onPress={
                    handleSubmit
                  }
                  style={
                    styles.retryButton
                  }
                >
                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Retry
                  </Text>
                </Pressable>

              </View>
            )}


            {/* AI Response */}

            {result &&
              !loading &&
              formattedResponse && (
                <View
                  style={
                    styles.aiCard
                  }
                >

                  <View
                    style={
                      styles.aiCardHeader
                    }
                  >

                    <View
                      style={
                        styles.aiAvatar
                      }
                    >
                      <Text
                        style={
                          styles.aiAvatarText
                        }
                      >
                        AI
                      </Text>
                    </View>


                    <View
                      style={
                        styles.aiHeaderText
                      }
                    >

                      <Text
                        style={
                          styles.aiName
                        }
                      >
                        IT Assistant
                      </Text>


                      <Text
                        style={
                          styles.aiSubtitle
                        }
                      >
                        {formattedResponse.title}
                      </Text>

                    </View>


                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusStyle(
                              result.status
                            ).backgroundColor,
                        },
                      ]}
                    >

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              getStatusStyle(
                                result.status
                              ).color,
                          },
                        ]}
                      >
                        {getStatusLabel(
                          result.status
                        )}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.responseDivider
                    }
                  />


                  {/* Human-readable response */}

                  <Text
                    style={
                      styles.responseTitle
                    }
                  >
                    {formattedResponse.title}
                  </Text>


                  <Text
                    style={
                      styles.responseText
                    }
                  >
                    {formattedResponse.message}
                  </Text>


                  {/* Metadata */}

                  <View
                    style={
                      styles.metadataContainer
                    }
                  >

                    <View
                      style={
                        styles.metadataItem
                      }
                    >

                      <Text
                        style={
                          styles.metadataLabel
                        }
                      >
                        QUERY TYPE
                      </Text>


                      <Text
                        style={
                          styles.metadataValue
                        }
                      >
                        {result.query_type}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.metadataItem
                      }
                    >

                      <Text
                        style={
                          styles.metadataLabel
                        }
                      >
                        STATUS
                      </Text>


                      <Text
                        style={[
                          styles.metadataValue,
                          {
                            color:
                              getStatusStyle(
                                result.status
                              ).color,
                          },
                        ]}
                      >
                        {getStatusLabel(
                          result.status
                        )}
                      </Text>

                    </View>

                  </View>


                  {/* New Request */}

                  <Pressable
                    onPress={
                      handleNewRequest
                    }
                    style={
                      styles.newRequestButton
                    }
                  >
                    <Text
                      style={
                        styles.newRequestButtonText
                      }
                    >
                      + New Request
                    </Text>
                  </Pressable>

                </View>
              )}

          </ScrollView>


          {/* Input */}

          {!result &&
            !loading && (
              <View
                style={
                  styles.inputArea
                }
              >

                <View
                  style={
                    styles.inputContainer
                  }
                >

                  <TextInput
                    value={query}
                    onChangeText={
                      setQuery
                    }
                    placeholder="Type your IT request..."
                    placeholderTextColor={
                      Colors.light.mutedText
                    }
                    multiline
                    maxLength={5000}
                    textAlignVertical="top"
                    style={
                      styles.input
                    }
                  />


                  <Pressable
                    onPress={
                      handleSubmit
                    }
                    disabled={
                      !query.trim()
                    }
                    style={[
                      styles.sendButton,
                      {
                        opacity:
                          query.trim()
                            ? 1
                            : 0.45,
                      },
                    ]}
                  >

                    <Text
                      style={
                        styles.sendButtonText
                      }
                    >
                      ➤
                    </Text>

                  </Pressable>

                </View>


                <Text
                  style={
                    styles.inputHint
                  }
                >
                  AI-powered enterprise IT
                  operations assistant
                </Text>

              </View>
            )}

        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}


// ---------------------------------------------------------
// Styles
// ---------------------------------------------------------

const styles = StyleSheet.create({

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor:
      Colors.light.border,
    backgroundColor:
      Colors.light.surface,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color:
      Colors.light.primary,
    marginBottom: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color:
      Colors.light.text,
  },

  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor:
      Colors.light.primaryLight,
  },

  headerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color:
      Colors.light.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },

  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 36,
  },

  aiIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Colors.light.primaryLight,
    marginBottom: 20,
  },

  aiIconText: {
    fontSize: 30,
    color:
      Colors.light.primary,
  },

  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    color:
      Colors.light.text,
    marginBottom: 10,
  },

  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color:
      Colors.light.secondaryText,
    maxWidth: 340,
    marginBottom: 28,
  },

  tipCard: {
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor:
      Colors.light.surface,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  tipIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color:
      Colors.light.text,
    marginBottom: 5,
  },

  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color:
      Colors.light.secondaryText,
  },

  instructionsLink: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: '700',
    color:
      Colors.light.primary,
  },

  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },

  userMessageLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color:
      Colors.light.mutedText,
    marginBottom: 6,
  },

  userBubble: {
    maxWidth: '88%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    backgroundColor:
      Colors.light.primary,
  },

  userText: {
    fontSize: 14,
    lineHeight: 21,
    color:
      Colors.light.surface,
  },

  aiCard: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
    backgroundColor:
      Colors.light.surface,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Colors.light.primaryLight,
    marginRight: 10,
  },

  aiAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color:
      Colors.light.primary,
  },

  aiHeaderText: {
    flex: 1,
  },

  aiName: {
    fontSize: 14,
    fontWeight: '700',
    color:
      Colors.light.text,
  },

  aiSubtitle: {
    fontSize: 11,
    color:
      Colors.light.secondaryText,
    marginTop: 2,
  },

  processingText: {
    fontSize: 11,
    color:
      Colors.light.secondaryText,
    marginTop: 2,
  },

  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor:
      Colors.light.surfaceSecondary,
  },

  processingMessage: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color:
      Colors.light.secondaryText,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  responseDivider: {
    height: 1,
    backgroundColor:
      Colors.light.border,
    marginVertical: 16,
  },

  responseTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color:
      Colors.light.text,
    marginBottom: 8,
  },

  responseText: {
    fontSize: 15,
    lineHeight: 24,
    color:
      Colors.light.text,
  },

  metadataContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor:
      Colors.light.border,
  },

  metadataItem: {
    flex: 1,
  },

  metadataLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color:
      Colors.light.mutedText,
    marginBottom: 4,
  },

  metadataValue: {
    fontSize: 12,
    fontWeight: '600',
    color:
      Colors.light.secondaryText,
  },

  newRequestButton: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor:
      Colors.light.primaryLight,
  },

  newRequestButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color:
      Colors.light.primary,
  },

  errorCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor:
      Colors.light.errorLight,
    borderWidth: 1,
    borderColor:
      Colors.light.error,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color:
      Colors.light.error,
    marginBottom: 6,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color:
      Colors.light.text,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor:
      Colors.light.error,
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color:
      Colors.light.surface,
  },

  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor:
      Colors.light.background,
  },

  inputContainer: {
    minHeight: 58,
    maxHeight: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 15,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor:
      Colors.light.surface,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 115,
    paddingTop: 10,
    paddingBottom: 8,
    paddingRight: 10,
    fontSize: 14,
    lineHeight: 20,
    color:
      Colors.light.text,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Colors.light.primary,
  },

  sendButtonText: {
    fontSize: 18,
    color:
      Colors.light.surface,
  },

  inputHint: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 10,
    color:
      Colors.light.mutedText,
  },

});