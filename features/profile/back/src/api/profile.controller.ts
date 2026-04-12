import type { Request, Response } from 'express';
import {
  awardExperienceUseCase,
  getProfileUseCase,
  profileRepository,
  searchProfilesUseCase,
} from '../config/profile.wiring';
import type { BonusType } from '../domain/experience.types';

export const searchProfilesController = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const page = typeof pageRaw === 'string' ? parseInt(pageRaw, 10) || 1 : 1;
    const limit = Math.min(
      50,
      typeof limitRaw === 'string' ? parseInt(limitRaw, 10) || 20 : 20,
    );
    const currentUserId = req.auth?.userId;
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
      console.warn(
        '[profile] awardExperience 400: bonusType inválido',
        { bonusType, hasMetadata: !!metadata },
      );
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
    const authId = req.auth?.userId;
    if (authId && authId === userId) {
      await profileRepository.recordDailyStreakActivity(userId);
    }
    const profile = await getProfileUseCase.execute(userId);
    res.status(200).json(profile);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener perfil';
    res.status(404).json({ message });
  }
};
