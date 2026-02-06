import type { Request, Response } from 'express';
import { getProfileUseCase } from '../config/profile.wiring';

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
