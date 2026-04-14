import OpenAI from 'openai';
import { SYSTEM_MESSAGE_EDUCATIONAL_NEWS } from '@/shared/constants/ai-financial-voice';
import type { AIProviderPort } from '../../domain/ports';

/**
 * Implementación del AIProviderPort para reescritura educativa.
 * Usa gpt-4o-mini.
 */
export class EducationalOpenAIProvider implements AIProviderPort {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async rewriteEducational(prompt: string): Promise<string> {
    console.log(
      '[iaNoticias] 12. EducationalOpenAI: llamando a gpt-4o-mini...',
      prompt.length,
    );

    const MAX_RETRIES = 2;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: SYSTEM_MESSAGE_EDUCATIONAL_NEWS,
            },
            { role: 'user', content: prompt },
          ],
        });
        const text = completion.choices[0]?.message?.content ?? '';
        console.log(
          '[iaNoticias] 13. EducationalOpenAI: respuesta recibida, length=',
          text?.length ?? 0,
        );
        return text;
      } catch (err) {
        lastError = err;
        console.warn(
          `[iaNoticias] EducationalOpenAI: intento ${attempt}/${MAX_RETRIES} fallido:`,
          err instanceof Error ? err.message : err,
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        }
      }
    }

    throw lastError;
  }
}
