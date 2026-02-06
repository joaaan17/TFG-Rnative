import type { AIProviderPort } from '../../domain/ports';

/**
 * Caso de uso: preguntar a la IA sobre mercados.
 * Aquí es donde dominas la IA: límites, disclaimers, contexto financiero.
 */
export class AskMarketAI {
  constructor(private readonly aiProvider: AIProviderPort) {}

  async execute(userPrompt: string): Promise<string> {
    const enrichedPrompt = `Eres un asistente financiero. Responde de forma educativa, clara y sin dar asesoramiento financiero directo.
Pregunta del usuario:
${userPrompt}`;

    return this.aiProvider.ask(enrichedPrompt);
  }
}
