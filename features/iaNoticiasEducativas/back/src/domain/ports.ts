/**
 * Puertos que el dominio espera.
 * Sin dependencias de Express, NewsAPI ni OpenAI.
 */

import type { RawNews } from './iaNoticiasEducativas.types';

export type GetHeadlinesOptions = { bypassCache?: boolean };

export interface NewsProviderPort {
  getHeadlines(options?: GetHeadlinesOptions): Promise<RawNews[]>;
  getNewsById(id: string): Promise<RawNews>;
}

export interface AIProviderPort {
  rewriteEducational(prompt: string): Promise<string>;
}
