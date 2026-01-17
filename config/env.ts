/**
 * Configuración de variables de entorno
 */

import Constants from 'expo-constants';

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  environment: process.env.NODE_ENV || 'development',
  isDev: __DEV__,
  os: Constants.expoConfig?.extra?.os || process.env.EXPO_OS,
} as const;

export default env;
