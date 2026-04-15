import {
  addDaysToDateKey,
  getConsultorioDateKey,
} from './consultorio-day.util';

export { addDaysToDateKey };

export function getYesterdayDateKey(now = new Date()): string {
  const today = getConsultorioDateKey(now);
  return addDaysToDateKey(today, -1);
}

/**
 * Racha estilo Duolingo: un incremento de racha como mucho por día civil (Europe/Madrid).
 * Cuenta tanto **XP** como **actividad diaria** (abrir perfil autenticado vía `recordDailyStreakActivity`).
 * - Primer día con actividad: racha = 1.
 * - Si el último día contado es ayer: +1.
 * - Si ya se contó hoy: no cambia la racha.
 * - Si hubo hueco de uno o más días: racha vuelve a 1.
 */
export function computeNextStreakAfterXp(
  currentBf: number,
  lastStreakDayKey: string | undefined | null,
  todayKey: string,
): { bf: number; lastStreakDayKey: string } {
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const safeBf = Math.max(0, Math.floor(currentBf));

  if (!lastStreakDayKey) {
    return { bf: 1, lastStreakDayKey: todayKey };
  }
  if (lastStreakDayKey === todayKey) {
    return { bf: Math.max(1, safeBf), lastStreakDayKey: todayKey };
  }
  if (lastStreakDayKey === yesterdayKey) {
    return { bf: safeBf + 1, lastStreakDayKey: todayKey };
  }
  return { bf: 1, lastStreakDayKey: todayKey };
}
