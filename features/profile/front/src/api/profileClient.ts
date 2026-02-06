import { Platform } from 'react-native';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/profile';
  if (Platform.OS === 'ios' || Platform.OS === 'web')
    return 'http://localhost:3000/api/profile';
  return 'http://localhost:3000/api/profile';
}

export const profileClient = {
  // Placeholder para futuros métodos (getProfile, updateProfile, etc.)
  getBaseUrl,
};
