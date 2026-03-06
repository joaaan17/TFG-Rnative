/**
 * Calcula nivel desde experiencia.
 * Cada 1000 XP = 1 nivel.
 * - 0–999 XP → Nivel 1
 * - 1000–1999 XP → Nivel 2
 * - 2000–2999 XP → Nivel 3
 */
export function getNivelFromExperience(experience: number): number {
  const exp = Math.max(0, Math.floor(experience));
  return Math.floor(exp / 1000) + 1;
}
