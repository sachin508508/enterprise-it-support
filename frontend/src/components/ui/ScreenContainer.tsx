import React from 'react';

import {
  StyleSheet,
  ViewStyle,
} from 'react-native';

import {
  SafeAreaView,
  Edge,
} from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
}

export default function ScreenContainer({
  children,
  style,
  edges = ['top'],
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },
});