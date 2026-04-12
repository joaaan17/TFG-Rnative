/**
 * Ligas por XP acumulado (misma lógica en servidor y cliente).
 */
export const DIVISION_THRESHOLDS = [
  { minXp: 0, name: 'Bronce' },
  { minXp: 5_000, name: 'Plata' },
  { minXp: 15_000, name: 'Oro' },
  { minXp: 40_000, name: 'Platino' },
  { minXp: 100_000, name: 'Diamante' },
] as const;

/** Normaliza XP desde Mongo/JSON (Long, string, etc.). */
export function toExperienceNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === 'bigint') {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const n = Number(String((value as { toString: () => string }).toString()));
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function getDivisionFromExperience(experience: unknown): string {
  const exp = toExperienceNumber(experience);
  let name: string = DIVISION_THRESHOLDS[0].name;
  for (const row of DIVISION_THRESHOLDS) {
    if (exp >= row.minXp) name = row.name;
  }
  return name;
}
