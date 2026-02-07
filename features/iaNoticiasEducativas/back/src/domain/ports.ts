/**
 * Puertos que el dominio espera.
 * Sin dependencias de Express, NewsAPI ni OpenAI.
 */

import type { RawNews } from './iaNoticiasEducativas.types';

export interface NewsProviderPort {
  getHeadlines(): Promise<RawNews[]>;
  getNewsById(id: string): Promise<RawNews>;
}

export interface AIProviderPort {
  rewriteEducational(prompt: string): Promise<string>;
}
