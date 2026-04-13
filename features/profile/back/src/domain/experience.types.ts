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
  BUY_STOCK: 250,
  SELL_STOCK: 250,
  COMPLETE_QUIZ: 0,
  VIEW_NEWS: 250,
  ASK_CONSULTORIO: 500,
};

/**
 * Tabla exacta de XP por aciertos en test (0-10).
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

export interface AwardExperienceRequest {
  bonusType: BonusType;
  /** Metadata opcional (newsId para VIEW_NEWS, correctCount para COMPLETE_QUIZ). */
  metadata?: Record<string, string>;
}
