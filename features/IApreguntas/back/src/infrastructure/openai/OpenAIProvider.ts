import OpenAI from 'openai';
import { SYSTEM_MESSAGE_IAPREGUNTAS } from '@/shared/constants/ai-financial-voice';
import type { AIProviderPort } from '../../domain/ports';

/**
 * Implementación concreta del AIProviderPort usando OpenAI.
 * Infraestructura pura: si mañana cambias de proveedor, este archivo muere y el resto sigue vivo.
 */
export class OpenAIProvider implements AIProviderPort {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async ask(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_MESSAGE_IAPREGUNTAS,
        },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content ?? '';
  }
}
