import OpenAI from 'openai';
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
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un profesor experto en inversión y mercados financieros. Transforma noticias en textos educativos.',
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
  }
}
