/**
 * Tabla exacta de XP por aciertos en test (0-10).
 * Sincronizada con el backend (experience.types.ts).
 * Progresión fuerte de 6 a 10 para incentivar excelencia.
 */
export const QUIZ_XP_BY_CORRECT_COUNT: Record<number, number> = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 100,
  7: 200,
  8: 400,
  9: 800,
  10: 1600,
};

export function getQuizXpForCorrectCount(correctCount: number): number {
  const capped = Math.min(10, Math.max(0, Math.floor(correctCount)));
  return QUIZ_XP_BY_CORRECT_COUNT[capped] ?? 0;
}
