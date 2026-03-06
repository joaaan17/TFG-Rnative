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
export const BONUS_XP: Record<BonusType, number> = {
  BUY_STOCK: 50,
  SELL_STOCK: 50,
  COMPLETE_QUIZ: 0, // Se calcula con QUIZ_XP_BY_CORRECT_COUNT según metadata.correctCount
  VIEW_NEWS: 50,
  ASK_CONSULTORIO: 100, // +100 XP por cada pregunta al consultorio con IA
};

/**
 * Tabla exacta de XP por aciertos en test (0-10).
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

export interface AwardExperienceRequest {
  bonusType: BonusType;
  /** Metadata opcional (newsId para VIEW_NEWS, correctCount para COMPLETE_QUIZ). */
  metadata?: Record<string, string>;
}
