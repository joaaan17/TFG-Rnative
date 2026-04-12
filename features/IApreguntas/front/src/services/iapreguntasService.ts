import { askAi, type AskConsultorioResponse } from '../api/iapreguntasClient';

export const iapreguntasService = {
  async askMarketAI(
    prompt: string,
    token: string,
  ): Promise<AskConsultorioResponse> {
    if (!prompt.trim()) {
      throw new Error('El prompt no puede estar vacío');
    }
    if (!token?.trim()) {
      throw new Error('Token requerido');
    }
    return askAi(prompt.trim(), token);
  },
};
