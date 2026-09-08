import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

import ScreenContainer from '../components/common/ScreenContainer';
import { Colors } from '../constants/colors';
import { submitHITLRequest } from '../services/hitl';


export default function HITLScreen() {

  const router = useRouter();

  const {
    id: conversationId,
  } = useLocalSearchParams<{
    id: string;
  }>();

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {

    if (!conversationId) {

      Alert.alert(
        'Error',
        'Conversation ID is missing.'
      );

      return;
    }

    if (reason.trim().length < 5) {

      Alert.alert(
        'Reason required',
        'Please provide a reason for human review.'
      );

      return;
    }

    try {

      setLoading(true);

      await submitHITLRequest(
        conversationId,
        reason.trim()
      );

      Alert.alert(
        'Submitted',
        'Your request has been submitted for human review.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {

      Alert.alert(
        'Submission failed',
        error instanceof Error
          ? error.message
          : 'Unable to submit the request.'
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <ScreenContainer
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.title}>
            Submit for Human Review
          </Text>

          <Text style={styles.subtitle}>
            Your request could not be completed automatically.
            An administrator can review it.
          </Text>

          <View style={styles.card}>

            <Text style={styles.label}>
              Reason for review
            </Text>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Explain why you need human assistance..."
              placeholderTextColor={Colors.light.mutedText}
              multiline
              textAlignVertical="top"
              style={styles.input}
              editable={!loading}
            />

            <Text style={styles.helper}>
              Please provide enough information for the
              administrator to understand your request.
            </Text>

          </View>

          <Text
            style={[
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={
              loading
                ? undefined
                : handleSubmit
            }
          >
            {loading
              ? 'Submitting...'
              : 'Submit for Review'}
          </Text>

          <Text
            style={styles.cancel}
            onPress={() => router.back()}
          >
            Cancel
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.secondaryText,
    marginBottom: 24,
  },

  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 10,
  },

  input: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },

  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.mutedText,
    marginTop: 10,
  },

  submitButton: {
    marginTop: 20,
    paddingVertical: 16,
    textAlign: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.primary,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.5,
  },

  cancel: {
    marginTop: 16,
    textAlign: 'center',
    color: Colors.light.secondaryText,
    fontSize: 15,
    fontWeight: '600',
  },
});