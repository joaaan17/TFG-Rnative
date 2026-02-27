/**
 * Tipos para la caché de precios L1 + L2.
 * Coherencia y coste: L1 rápido, L2 Mongo compartido, deduplicación in-flight.
 */

export type CacheStrategy = 'cache-first' | 'swr' | 'network-first';

export type CacheStatus =
  | 'HIT_L1'
  | 'HIT_L2'
  | 'MISS_FETCH'
  | 'STALE_SERVED_REFRESHING'
  | 'INFLIGHT_JOINED';

export type CacheEntryType = 'QUOTE' | 'HISTORICAL';

export interface CacheEntryMeta {
  symbol: string;
  type: CacheEntryType;
  provider?: string;
  interval?: string;
  range?: string;
}

/** Entrada L1 en memoria. */
export interface L1Entry<T = unknown> {
  value: T;
  fetchedAt: number;
  expiresAt: number;
  staleAt: number;
  source: CacheStatus;
  meta?: CacheEntryMeta;
}

/** Respuesta de quote con estado de caché (para API). */
export interface QuoteWithStatus {
  symbol: string;
  name: string;
  price?: number;
  currency?: string;
  fetchedAt?: number;
  cacheStatus: CacheStatus;
}

/** Estadísticas del servicio de caché. */
export interface PriceCacheStats {
  hitsL1: number;
  hitsL2: number;
  misses: number;
  inflightCount: number;
  sizeL1: number;
}
