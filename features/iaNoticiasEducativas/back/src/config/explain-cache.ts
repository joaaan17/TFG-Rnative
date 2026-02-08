import type { EducationalNews } from '../domain/iaNoticiasEducativas.types';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora
const MAX_CACHE_SIZE = 50;

type CacheEntry = { educationalNews: EducationalNews; expiresAt: number };

/** Cache compartido de explicaciones ChatGPT. Usado por /explain y por el scheduler. */
const explainCache = new Map<string, CacheEntry>();

export function getExplainCached(newsId: string): EducationalNews | null {
  const id = newsId.trim();
  const entry = explainCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    explainCache.delete(id);
    return null;
  }
  return entry.educationalNews;
}

export function setExplainCached(
  newsId: string,
  educationalNews: EducationalNews,
): void {
  const id = newsId.trim();
  if (explainCache.size >= MAX_CACHE_SIZE) {
    const firstKey = explainCache.keys().next().value;
    if (firstKey != null) explainCache.delete(firstKey);
  }
  explainCache.set(id, {
    educationalNews,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
