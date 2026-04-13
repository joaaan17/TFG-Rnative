import type { Request, Response } from 'express';
import {
  awardExperienceUseCase,
  getProfileUseCase,
  profileRepository,
  searchProfilesUseCase,
  suggestProfilesUseCase,
  syncAchievementCashRewardsUseCase,
} from '../config/profile.wiring';
import type { BonusType } from '../domain/experience.types';

/** Solo acepta ids de documento Mongo (cualquier otro segmento → 404, nunca CastError). */
const MONGO_OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/;

export const searchProfilesController = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const page = typeof pageRaw === 'string' ? parseInt(pageRaw, 10) || 1 : 1;
    const currentUserId = req.auth?.userId;

    /** Sin texto: mismo endpoint, lista de usuarios registrados a los que aún puedes enviar solicitud. */
    if (!q.trim()) {
      if (!currentUserId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      const maxList = 100;
      const limit = Math.min(
        maxList,
        typeof limitRaw === 'string' ? parseInt(limitRaw, 10) || 50 : 50,
      );
      const result = await suggestProfilesUseCase.execute(
        currentUserId,
        limit,
        page,
      );
      res.status(200).json(result);
      return;
    }

    const limit = Math.min(
      50,
      typeof limitRaw === 'string' ? parseInt(limitRaw, 10) || 20 : 20,
    );
    const result = await searchProfilesUseCase.execute(
      q,
      page,
      limit,
      currentUserId,
    );
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al buscar perfiles';
    res.status(500).json({ message });
  }
};

export const awardExperienceController = async (
  req: Request<
    Record<string, never>,
    unknown,
    { bonusType?: BonusType; metadata?: Record<string, string> }
  >,
  res: Response,
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const bonusType = req.body?.bonusType;
    const metadata = req.body?.metadata;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[profile] awardExperience body:', {
        bonusType,
        hasMetadata: !!metadata,
        metadataKeys: metadata ? Object.keys(metadata) : [],
      });
    }

    if (
      !bonusType ||
      !['BUY_STOCK', 'SELL_STOCK', 'COMPLETE_QUIZ', 'VIEW_NEWS'].includes(
        bonusType,
      )
    ) {
      console.warn('[profile] awardExperience 400: bonusType inválido', {
        bonusType,
        hasMetadata: !!metadata,
      });
      res.status(400).json({
        message:
          'bonusType requerido: BUY_STOCK | SELL_STOCK | COMPLETE_QUIZ | VIEW_NEWS (el consultorio otorga XP al enviar la pregunta)',
      });
      return;
    }
    const result = await awardExperienceUseCase.execute(
      userId,
      bonusType,
      metadata,
    );
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al otorgar experiencia';
    console.error('[profile] awardExperience error:', message);
    const isValidation =
      typeof message === 'string' &&
      (message.includes('requiere') || message.includes('userId'));
    res.status(isValidation ? 400 : 500).json({ message });
  }
};

export const getProfileController = async (
  req: Request<{ id?: string }>,
  res: Response,
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ message: 'ID de usuario requerido' });
      return;
    }
    if (!MONGO_OBJECT_ID_HEX.test(userId)) {
      res.status(404).json({ message: 'Perfil no encontrado' });
      return;
    }
    const authId = req.auth?.userId;
    let achievementGrantsPayload:
      | {
          grants: { level: number; amountUsd: number }[];
          totalGrantedUsd: number;
        }
      | undefined;
    if (authId && authId === userId) {
      await profileRepository.recordDailyStreakActivity(userId);
      const sync = await syncAchievementCashRewardsUseCase.execute(userId);
      if (sync.grants.length > 0) {
        achievementGrantsPayload = {
          grants: sync.grants,
          totalGrantedUsd: sync.totalGrantedUsd,
        };
      }
    }
    const profile = await getProfileUseCase.execute(userId);
    res
      .status(200)
      .json(
        achievementGrantsPayload
          ? { ...profile, lastAchievementGrants: achievementGrantsPayload }
          : profile,
      );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener perfil';
    res.status(404).json({ message });
  }
};
