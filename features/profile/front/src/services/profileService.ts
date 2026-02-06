/**
 * profileService — Lógica frontend de Profile
 *
 * Única capa que usa profileClient (HTTP puro).
 * Centraliza validaciones y criterios de error.
 */

import { profileClient } from '../api/profileClient';
import type {
  ProfileUser,
  ProfileSearchItem,
} from '../types/profile.types';

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const profileService = {
  async getProfile(userId: string): Promise<ProfileUser> {
    const trimmed = userId?.trim();
    if (!trimmed) {
      throw new Error('ID de usuario requerido');
    }
    return profileClient.getProfile(trimmed);
  },

  async searchProfiles(
    q: string,
    token: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: ProfileSearchItem[] }> {
    if (!token?.trim()) {
      throw new Error('Token requerido');
    }
    return profileClient.searchProfiles(
      (q ?? '').trim().slice(0, 50),
      Math.max(1, page),
      Math.min(50, Math.max(1, limit)),
      token.trim(),
    );
  },

  extractErrorMessage,
};
