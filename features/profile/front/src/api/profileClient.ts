import { Platform } from 'react-native';
import type {
  ProfileUser,
  ProfileSearchItem,
} from '../types/profile.types';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/profile';
  if (Platform.OS === 'ios' || Platform.OS === 'web')
    return 'http://localhost:3000/api/profile';
  return 'http://localhost:3000/api/profile';
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const profileClient = {
  getBaseUrl,

  async getProfile(userId: string): Promise<ProfileUser> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/${userId}`, { method: 'GET' });
    const data = await parseJsonSafe(response);

    if (!response.ok) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : 'Error al obtener perfil';
      throw new Error(message);
    }

    return data as ProfileUser;
  },

  async searchProfiles(
    q: string,
    page: number,
    limit: number,
    token: string,
  ): Promise<{ items: ProfileSearchItem[] }> {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
      q: q.trim().slice(0, 50),
      page: String(page),
      limit: String(Math.min(50, limit)),
    });
    const response = await fetch(`${baseUrl}/search?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : 'Error al buscar perfiles';
      throw new Error(message);
    }
    return data as { items: ProfileSearchItem[] };
  },
};
