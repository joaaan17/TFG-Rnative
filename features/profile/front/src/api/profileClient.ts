import { Platform } from 'react-native';
import type { ProfileUser, ProfileSearchItem } from '../types/profile.types';

export type BonusType =
  | 'BUY_STOCK'
  | 'SELL_STOCK'
  | 'COMPLETE_QUIZ'
  | 'VIEW_NEWS'
  | 'ASK_CONSULTORIO';

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

  async awardExperience(
    token: string,
    bonusType: BonusType,
    metadata?: Record<string, string>,
  ): Promise<{ experienceAwarded: number; newTotal: number }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/experience/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bonusType, metadata }),
    });
    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : 'Error al otorgar experiencia';
      if (__DEV__) {
        console.warn(
          '[profileClient.awardExperience]',
          response.status,
          message,
          { bonusType, metadata },
        );
      }
      throw new Error(message);
    }
    return data as { experienceAwarded: number; newTotal: number };
  },
};
