import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  // Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  // iOS Simulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:8000';
  }

  // Web
  return 'http://localhost:8000';
};

export const APP_CONFIG = {
  name: 'IT Support AI',
  description: 'Enterprise IT Operations Assistant',

  API_BASE_URL: getApiBaseUrl(),
} as const;