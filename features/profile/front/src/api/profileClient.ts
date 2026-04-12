import { Platform } from 'react-native';
import { env } from '@/config/env';
import type { ProfileUser, ProfileSearchItem } from '../types/profile.types';

/** Bonificaciones que el cliente puede solicitar por POST /experience/award (el consultorio otorga XP en su propio endpoint). */
export type ProfileAwardBonusType =
  | 'BUY_STOCK'
  | 'SELL_STOCK'
  | 'COMPLETE_QUIZ'
  | 'VIEW_NEWS';

function getBaseUrl() {
  const base =
    env.apiUrl && env.apiUrl !== 'https://api.example.com'
      ? env.apiUrl.replace(/\/$/, '')
      : Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
  return `${base}/api/profile`;
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

  async getProfile(
    userId: string,
    token?: string | null,
  ): Promise<ProfileUser> {
    const baseUrl = getBaseUrl();
    const headers: Record<string, string> = {};
    const t = token?.trim();
    if (t) {
      headers.Authorization = `Bearer ${t}`;
    }
    const response = await fetch(`${baseUrl}/${userId}`, {
      method: 'GET',
      headers: Object.keys(headers).length ? headers : undefined,
    });
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
    bonusType: ProfileAwardBonusType,
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
