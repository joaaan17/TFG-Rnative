import { buildAskMarketUserEnvelope } from '@/shared/constants/ai-financial-voice';
import type { AIProviderPort } from '../../domain/ports';

/**
 * Caso de uso: preguntar a la IA sobre mercados.
 * La voz y estructura viven en `ai-financial-voice.ts` (sistema replicable).
 */
export class AskMarketAI {
  constructor(private readonly aiProvider: AIProviderPort) {}

  async execute(userPrompt: string): Promise<string> {
    return this.aiProvider.ask(buildAskMarketUserEnvelope(userPrompt));
  }
}
