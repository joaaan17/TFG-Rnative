import { getNivelFromExperience } from '@/shared/constants/xp-level';
import type {
  AchievementCategoryConfig,
  AchievementContext,
  AchievementDefinition,
} from '@/shared/constants/achievements';
import {
  isAchievementUnlocked,
  LEVEL_MILESTONE_CONFIG,
} from '@/shared/constants/achievements';

/**
 * Obtiene el contexto de logros a partir del XP del usuario.
 */
export function getAchievementContext(experience: number): AchievementContext {
  return {
    experience,
    level: getNivelFromExperience(experience),
  };
}

/**
 * Lista de definiciones de logros para la categoría por nivel.
 */
export function getLevelMilestoneDefinitions(): AchievementDefinition[] {
  return LEVEL_MILESTONE_CONFIG.getDefinitions(LEVEL_MILESTONE_CONFIG);
}

/**
 * Determina qué logros están desbloqueados según el XP/nivel actual.
 */
export function getUnlockedAchievementIds(experience: number): Set<string> {
  const ctx = getAchievementContext(experience);
  const definitions = getLevelMilestoneDefinitions();
  const unlocked = new Set<string>();
  for (const def of definitions) {
    if (isAchievementUnlocked(def, LEVEL_MILESTONE_CONFIG, ctx)) {
      unlocked.add(def.id);
    }
  }
  return unlocked;
}
