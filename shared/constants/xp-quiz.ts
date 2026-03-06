/**
 * Tabla exacta de XP por aciertos en test (0-10).
 * Sincronizada con el backend (experience.types.ts).
 * Progresión fuerte de 6 a 10 para incentivar excelencia.
 * TEMPORAL: x10 en todas las recompensas.
 */
export const QUIZ_XP_BY_CORRECT_COUNT: Record<number, number> = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 1000,
  7: 2000,
  8: 4000,
  9: 8000,
  10: 16000,
};

export function getQuizXpForCorrectCount(correctCount: number): number {
  const capped = Math.min(10, Math.max(0, Math.floor(correctCount)));
  return QUIZ_XP_BY_CORRECT_COUNT[capped] ?? 0;
}
