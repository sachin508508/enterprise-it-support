import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const [employeeId, setEmployeeId] =
    useState('');

  const [password, setPassword] =
    useState('');

  const handleLogin = async () => {
    if (!employeeId.trim() || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your employee ID and password.'
      );
      return;
    }

    try {
      await login(
        employeeId.trim(),
        password
      );

      router.replace('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to login. Please try again.';

      Alert.alert(
        'Login Failed',
        message
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            IT Support AI
          </Text>

          <Text style={styles.subtitle}>
            Enterprise IT Operations Assistant
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            Employee ID
          </Text>

          <TextInput
            style={styles.input}
            value={employeeId}
            onChangeText={setEmployeeId}
            placeholder="Enter employee ID"
            placeholderTextColor={
              Colors.light.mutedText
            }
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={
              Colors.light.mutedText
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              isLoading &&
                styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.buttonText}>
                Login
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    textAlign: 'center',
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 20,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});