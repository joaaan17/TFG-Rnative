import type { Request, Response } from 'express';
import {
  getProfileUseCase,
  searchProfilesUseCase,
} from '../config/profile.wiring';

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
    const profile = await getProfileUseCase.execute(userId);
    res.status(200).json(profile);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener perfil';
    res.status(404).json({ message });
  }
};
