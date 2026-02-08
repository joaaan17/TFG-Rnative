import { Platform } from 'react-native';

/**
 * Cliente HTTP de la feature Investments.
 * Extender cuando se añadan endpoints de cartera/efectivo.
 */
function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/investments';
  return 'http://localhost:3000/api/investments';
}

export { getBaseUrl };
