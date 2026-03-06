import { useCallback } from 'react';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { getNivelFromExperience } from '@/shared/constants/xp-level';
import {
  emitLevelUp,
  emitProfileXpAwarded,
} from '../events/profile-events';
import { profileClient, type BonusType } from '../api/profileClient';

/**
 * Hook para otorgar experiencia al usuario desde acciones (compra, venta, quiz, noticia).
 * Usa el token de sesión. Falla en silencio si no hay token o la API falla.
 */
export function useAwardExperience() {
  const { session } = useAuthSession();

  const award = useCallback(
    async (
      bonusType: BonusType,
      metadata?: Record<string, string>,
    ): Promise<number | null> => {
      const token = session?.token;
      if (!token) return null;
      try {
        const { experienceAwarded, newTotal } =
          await profileClient.awardExperience(
            token,
            bonusType,
            metadata,
          );
        if (experienceAwarded != null && experienceAwarded > 0) {
          emitProfileXpAwarded();
          const previousTotal = newTotal - experienceAwarded;
          const previousLevel = getNivelFromExperience(previousTotal);
          const newLevel = getNivelFromExperience(newTotal);
          if (newLevel > previousLevel) {
            emitLevelUp(newLevel, newTotal);
          }
        }
        return experienceAwarded;
      } catch (err) {
        if (__DEV__) {
          console.warn('[awardExperience] Error:', err);
        }
        return null;
      }
    },
    [session?.token],
  );

  return { award };
}
