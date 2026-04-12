import { getNivelFromExperience } from '@/shared/constants/xp-level';
import {
  emitLevelUp,
  emitProfileXpAwarded,
} from '../events/profile-events';

/** Misma lógica que useAwardExperience cuando el servidor devuelve XP ya aplicada. */
export function applyXpFromServerAward(
  experienceAwarded: number,
  newTotal: number,
): void {
  if (experienceAwarded <= 0) return;
  emitProfileXpAwarded();
  const previousTotal = newTotal - experienceAwarded;
  const previousLevel = getNivelFromExperience(previousTotal);
  const newLevel = getNivelFromExperience(newTotal);
  if (newLevel > previousLevel) {
    emitLevelUp(newLevel, newTotal);
  }
}
