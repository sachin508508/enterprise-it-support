import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.light.primary}
        />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/dashboard" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Colors.light.background,
  },
});