/**
 * Tipos para el sistema de experiencia y bonos.
 * Cada acción (compra, venta, test, noticia) otorga XP que se suma al perfil.
 */

export type BonusType =
  | 'BUY_STOCK'
  | 'SELL_STOCK'
  | 'COMPLETE_QUIZ'
  | 'VIEW_NEWS'
  | 'ASK_CONSULTORIO';

/** XP otorgado por cada tipo de bono (fijos). COMPLETE_QUIZ usa QUIZ_XP_BY_CORRECT_COUNT. */
/** TEMPORAL: x10 en todas las recompensas hasta que se indique volver a normal. */
export const BONUS_XP: Record<BonusType, number> = {
  BUY_STOCK: 500, // 50 x10
  SELL_STOCK: 500, // 50 x10
  COMPLETE_QUIZ: 0, // Se calcula con QUIZ_XP_BY_CORRECT_COUNT según metadata.correctCount
  VIEW_NEWS: 500, // 50 x10
  ASK_CONSULTORIO: 1000, // 100 x10
};

/**
 * Tabla exacta de XP por aciertos en test (0-10).
 * Progresión fuerte de 6 a 10 para incentivar excelencia.
 * TEMPORAL: x10 en todas las recompensas.
 */
export const QUIZ_XP_BY_CORRECT_COUNT: Record<number, number> = {
  0: 0,
  1: 100, // 10 x10
  2: 200, // 20 x10
  3: 300, // 30 x10
  4: 400, // 40 x10
  5: 500, // 50 x10
  6: 1000, // 100 x10
  7: 2000, // 200 x10
  8: 4000, // 400 x10
  9: 8000, // 800 x10
  10: 16000, // 1600 x10
};

export interface AwardExperienceRequest {
  bonusType: BonusType;
  /** Metadata opcional (newsId para VIEW_NEWS, correctCount para COMPLETE_QUIZ). */
  metadata?: Record<string, string>;
}
