/**
 * Tabla exacta de XP por aciertos en test (0-10).
 * Sincronizada con el backend (experience.types.ts).
 * Progresión fuerte de 6 a 10 para incentivar excelencia.
 */
export const QUIZ_XP_BY_CORRECT_COUNT: Record<number, number> = {
  0: 0,
  1: 50,
  2: 100,
  3: 150,
  4: 200,
  5: 250,
  6: 500,
  7: 1000,
  8: 2000,
  9: 4000,
  10: 8000,
};

export function getQuizXpForCorrectCount(correctCount: number): number {
  const capped = Math.min(10, Math.max(0, Math.floor(correctCount)));
  return QUIZ_XP_BY_CORRECT_COUNT[capped] ?? 0;
}
