/**
 * Configuración de logros y "clínicas" (criterios de desbloqueo).
 * Estructura latente: se pueden añadir nuevos tipos de logros y criterios
 * sin tocar la UI.
 */

/** Criterio para desbloquear un logro (clínica) */
export type AchievementClinica =
  | { type: 'level_milestone'; levelsPerAchievement: number }
  | { type: 'monthly_reset'; slots: number }
  | { type: 'custom'; checker: (ctx: AchievementContext) => boolean };

export type AchievementContext = {
  /** XP total del usuario */
  experience: number;
  /** Nivel actual (derivado de experience) */
  level: number;
  /** Mes actual para reset mensual (si aplica) */
  month?: number;
  year?: number;
};

/** Definición de un logro individual */
export type AchievementDefinition = {
  id: string;
  label: string;
  /** Nivel requerido para desbloquear (para level_milestone) */
  requiredLevel?: number;
  /** Índice del slot (0-based) */
  slotIndex: number;
};

/** Configuración de una categoría de logros */
export type AchievementCategoryConfig = {
  id: string;
  title: string;
  /** Clínica que determina cómo se desbloquean */
  clinica: AchievementClinica;
  /** Número total de slots (casillas) */
  totalSlots: number;
  /** Genera las definiciones de logros */
  getDefinitions: (
    config: AchievementCategoryConfig,
  ) => AchievementDefinition[];
};

/**
 * Clínica: cada N niveles = 1 logro desbloqueado.
 * Niveles 5, 10, 15, 20... → logro 1, 2, 3, 4...
 */
const LEVELS_PER_ACHIEVEMENT = 5;

/** Último nivel-hito con logro (5, 10, …, MAX) — 16 slots hasta nivel 80 */
export const LEVEL_MILESTONE_MAX_LEVEL = 80;

/** Recompensa en efectivo (USD) por cada logro de nivel (debe coincidir con el backend). */
export const ACHIEVEMENT_LEVEL_CASH_USD = 10_000;

export function getMilestoneLevelList(): number[] {
  const out: number[] = [];
  for (
    let L = LEVELS_PER_ACHIEVEMENT;
    L <= LEVEL_MILESTONE_MAX_LEVEL;
    L += LEVELS_PER_ACHIEVEMENT
  ) {
    out.push(L);
  }
  return out;
}

/** Categoría "Logros por nivel" - cada 5 niveles un logro */
export const LEVEL_MILESTONE_CONFIG: AchievementCategoryConfig = {
  id: 'level_milestone',
  title: 'LOGROS POR NIVEL',
  clinica: {
    type: 'level_milestone',
    levelsPerAchievement: LEVELS_PER_ACHIEVEMENT,
  },
  totalSlots: getMilestoneLevelList().length,
  getDefinitions: (config) => {
    return Array.from({ length: config.totalSlots }, (_, i) => {
      const requiredLevel = (i + 1) * LEVELS_PER_ACHIEVEMENT;
      return {
        id: `level_${requiredLevel}`,
        label: `Nivel ${requiredLevel}`,
        requiredLevel,
        slotIndex: i,
      };
    });
  },
};

/** Todas las categorías de logros (estructura extensible) */
export const ACHIEVEMENT_CATEGORIES: AchievementCategoryConfig[] = [
  LEVEL_MILESTONE_CONFIG,
];

/**
 * Comprueba si un logro está desbloqueado según la clínica.
 */
export function isAchievementUnlocked(
  definition: AchievementDefinition,
  config: AchievementCategoryConfig,
  ctx: AchievementContext,
): boolean {
  const { clinica } = config;
  switch (clinica.type) {
    case 'level_milestone':
      return (definition.requiredLevel ?? 0) <= ctx.level;
    case 'monthly_reset':
      return false; // TODO: lógica mensual cuando se implemente
    case 'custom':
      return clinica.checker(ctx);
    default:
      return false;
  }
}
