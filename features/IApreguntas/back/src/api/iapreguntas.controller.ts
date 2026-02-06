import type { Request, Response } from 'express';
import { askMarketAI } from '../config/iapreguntas.wiring';

/**
 * Controller delgado, sin lógica.
 * Solo extrae datos, llama al caso de uso y devuelve respuesta.
 */
export async function askAiController(req: Request, res: Response) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt requerido' });
    return;
  }

  const answer = await askMarketAI.execute(prompt);
  res.json({ answer });
}
