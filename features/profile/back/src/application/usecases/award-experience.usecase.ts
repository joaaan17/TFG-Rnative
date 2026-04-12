import type { ProfileRepository } from '../../domain/ports';
import {
  BONUS_XP,
  QUIZ_XP_BY_CORRECT_COUNT,
  type BonusType,
} from '../../domain/experience.types';

/**
 * Caso de uso: otorgar experiencia al usuario por una acción (compra, venta, test, noticia).
 * - VIEW_NEWS: +50 XP, idempotente (1 vez por noticia y usuario).
 * - COMPLETE_QUIZ: XP según tabla por nº de aciertos (0-10).
 * - BUY_STOCK / SELL_STOCK: XP fijo.
 */
export class AwardExperienceUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(
    userId: string,
    bonusType: BonusType,
    metadata?: Record<string, string>,
  ): Promise<{ experienceAwarded: number; newTotal: number }> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) throw new Error('userId is required');

    if (bonusType === 'VIEW_NEWS') {
      const newsId = metadata?.newsId?.trim();
      if (!newsId) {
        throw new Error('VIEW_NEWS requiere metadata.newsId');
      }
      const xp = BONUS_XP.VIEW_NEWS;
      const { awarded, newTotal } =
        await this.profileRepository.addExperienceIfNewsNotClaimed(
          uid,
          newsId,
          xp,
        );
      return { experienceAwarded: awarded ? xp : 0, newTotal };
    }

    if (bonusType === 'ASK_CONSULTORIO') {
      throw new Error(
        'ASK_CONSULTORIO se otorga automáticamente al enviar la pregunta al consultorio',
      );
    }

    if (bonusType === 'COMPLETE_QUIZ') {
      const raw = metadata?.correctCount ?? '';
      const correctCount = Math.min(
        10,
        Math.max(0, parseInt(raw, 10) || 0),
      );
      const xp =
        QUIZ_XP_BY_CORRECT_COUNT[correctCount] ??
        QUIZ_XP_BY_CORRECT_COUNT[0];
      const newTotal = await this.profileRepository.addExperience(uid, xp);
      return { experienceAwarded: xp, newTotal };
    }

    const xp = BONUS_XP[bonusType];
    if (!Number.isFinite(xp) || xp < 0) {
      throw new Error(`bonusType "${bonusType}" no tiene XP configurado`);
    }
    const newTotal = await this.profileRepository.addExperience(uid, xp);
    return { experienceAwarded: xp, newTotal };
  }
}
