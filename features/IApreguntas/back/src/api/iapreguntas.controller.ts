import type { Request, Response } from 'express';
import { BONUS_XP } from '../../../../profile/back/src/domain/experience.types';
import { profileRepository } from '../../../../profile/back/src/config/profile.wiring';
import { askMarketAI } from '../config/iapreguntas.wiring';

/**
 * Reserva cupo diario (2/día), llama a la IA y otorga XP solo si la respuesta es correcta.
 */
export async function askAiController(req: Request, res: Response) {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt requerido' });
    return;
  }

  let reserve: { ok: boolean; remainingAfter: number };
  try {
    reserve = await profileRepository.reserveConsultorioQuestion(userId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al reservar cupo';
    res.status(500).json({ error: message });
    return;
  }

  if (!reserve.ok) {
    res.status(429).json({
      error:
        'Has alcanzado el límite de 2 preguntas al día en el consultorio. Vuelve mañana.',
      consultorioRemainingToday: 0,
    });
    return;
  }

  try {
    const answer = await askMarketAI.execute(prompt);
    const newTotal = await profileRepository.addExperience(
      userId,
      BONUS_XP.ASK_CONSULTORIO,
    );
    res.json({
      answer,
      experienceAwarded: BONUS_XP.ASK_CONSULTORIO,
      newTotal,
      consultorioRemainingToday: reserve.remainingAfter,
    });
  } catch (err) {
    await profileRepository.releaseConsultorioQuestion(userId).catch(() => {});
    const message =
      err instanceof Error ? err.message : 'Error al consultar la IA';
    res.status(500).json({ error: message });
  }
}
