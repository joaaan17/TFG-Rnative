import type { CandlesResponse, QuoteItem } from '../../domain/market.types';
import { PriceCacheModel } from './price-cache.model';
import type {
  CacheStatus,
  CacheStrategy,
  L1Entry,
  PriceCacheStats,
  QuoteWithStatus,
} from './price-cache.types';

const LOG_PREFIX = '[PriceCache]';

/** Emoticonos para ver en terminal: caché = sin petición API, API = petición externa. */
const E = {
  CACHE_L1: '📦',
  CACHE_L2: '💾',
  API_CALL: '🌐',
  STALE_REVALIDATE: '🔄',
  INFLIGHT: '⏳',
  DONE: '✅',
  WARMUP: '🔥',
} as const;

/** Símbolos "hot" (Magnificent 7): TTL más corto para refresco más frecuente. */
export const HOT_SYMBOLS = [
  'AAPL',
  'MSFT',
  'AMZN',
  'GOOGL',
  'NVDA',
  'META',
  'TSLA',
] as const;

const TTL_QUOTE_HOT_MS = 10 * 60 * 1000;   // 10 min
const TTL_QUOTE_NORMAL_MS = 30 * 60 * 1000; // 30 min
const TTL_HISTORICAL_MS = 12 * 60 * 60 * 1000; // 12 h
/** Porcentaje del TTL tras el cual consideramos "stale" (servir + revalidar en background). */
const STALE_RATIO = 0.8;

/** Clave L2: QUOTE:AAPL o HIST:AAPL:1d:1mo */
function quoteKey(symbol: string): string {
  return `QUOTE:${symbol.toUpperCase()}`;
}
function historicalKey(symbol: string, interval: string, range: string): string {
  return `HIST:${symbol.toUpperCase()}:${interval}:${range}`;
}

function isHot(symbol: string): boolean {
  return HOT_SYMBOLS.includes(symbol.toUpperCase() as (typeof HOT_SYMBOLS)[number]);
}

export type FetchQuotesFn = (symbols: string[]) => Promise<QuoteItem[]>;
export type FetchCandlesFn = (
  symbol: string,
  timeframe: string,
  range?: string,
) => Promise<CandlesResponse>;

export interface PriceCacheServiceOptions {
  fetchQuotes: FetchQuotesFn;
  fetchCandles: FetchCandlesFn;
}

/** L1 en memoria: clave -> entrada con value, fetchedAt, expiresAt, staleAt. */
const L1 = new Map<string, L1Entry>();
/** Deduplicación: clave -> Promise del fetch en curso. */
const inFlight = new Map<string, Promise<unknown>>();

/** Contadores para stats (se incrementan en cada decisión). */
let statsHitsL1 = 0;
let statsHitsL2 = 0;
let statsMisses = 0;

function now(): number {
  return Date.now();
}

function log(msg: string, extra?: Record<string, unknown>): void {
  const parts = [LOG_PREFIX, msg];
  if (extra && Object.keys(extra).length > 0) {
    parts.push(JSON.stringify(extra));
  }
  console.log(parts.join(' '));
}

export class PriceCacheService {
  constructor(private readonly options: PriceCacheServiceOptions) {}

  /** Obtiene cotizaciones pasando por L1 → L2 → provider. Devuelve por símbolo con cacheStatus. */
  async getQuotes(
    symbols: string[],
    strategy: CacheStrategy = 'swr',
    requestId?: string,
  ): Promise<{ quotes: QuoteWithStatus[]; stats?: { hitsL1: number; hitsL2: number; misses: number } }> {
    const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
    if (unique.length === 0) {
      return { quotes: [] };
    }
    const start = now();
    const results: QuoteWithStatus[] = [];
    const toFetch: string[] = [];

    for (const symbol of unique) {
      const key = quoteKey(symbol);
      const l1Entry = L1.get(key) as L1Entry<QuoteItem> | undefined;
      const age = l1Entry ? (now() - l1Entry.fetchedAt) / 1000 : null;
      const expiresIn = l1Entry ? (l1Entry.expiresAt - now()) / 1000 : null;

      if (l1Entry && now() < l1Entry.expiresAt && (strategy === 'cache-first' || strategy === 'swr')) {
        const isStale = now() >= l1Entry.staleAt;
        if (!isStale) {
          statsHitsL1++;
          log(`${E.CACHE_L1} CACHÉ L1 (sin API) ${key} age=${age}s expiresIn=${expiresIn}s`, { requestId });
          results.push({
            ...l1Entry.value,
            fetchedAt: l1Entry.fetchedAt,
            cacheStatus: 'HIT_L1',
          });
          continue;
        }
        if (strategy === 'swr') {
          statsHitsL1++;
          log(`${E.STALE_REVALIDATE} CACHÉ (actualizando) ${key} age=${age}s refresh=START`, { requestId });
          this.refreshQuoteInBackground(symbol).catch(() => {});
          results.push({
            ...l1Entry.value,
            fetchedAt: l1Entry.fetchedAt,
            cacheStatus: 'STALE_SERVED_REFRESHING',
          });
          continue;
        }
      }

      if (strategy === 'network-first') {
        toFetch.push(symbol);
        continue;
      }

      const existing = inFlight.get(key);
      if (existing) {
        try {
          const list = (await existing) as QuoteItem[];
          const item = list.find((q) => q.symbol === symbol);
          if (item) {
            results.push({
              ...item,
              fetchedAt: now(),
              cacheStatus: 'INFLIGHT_JOINED',
            });
            log(`${E.INFLIGHT} Esperando petición en curso ${key}`, { requestId });
          } else {
            toFetch.push(symbol);
          }
        } catch {
          toFetch.push(symbol);
        }
        continue;
      }

      const fromL2 = await this.getFromL2(key);
      if (fromL2 && now() < (fromL2.expiresAt as number)) {
        const value = fromL2.value as QuoteItem;
        const age = (now() - (fromL2.fetchedAt as number)) / 1000;
        statsHitsL2++;
        log(`${E.CACHE_L2} CACHÉ L2 (sin API) ${key} age=${age}s → L1`, { requestId });
        this.setL1(key, value, 'QUOTE', { symbol: value.symbol });
        results.push({
          ...value,
          fetchedAt: fromL2.fetchedAt as number,
          cacheStatus: 'HIT_L2',
        });
        continue;
      }

      toFetch.push(symbol);
    }

    if (toFetch.length > 0) {
      const fetched = await this.fetchAndSetQuotes(toFetch, requestId);
      for (const item of fetched) {
        results.push(item);
      }
    }

    const took = now() - start;
    const hitsL1 = results.filter((r) => r.cacheStatus === 'HIT_L1').length;
    const hitsL2 = results.filter((r) => r.cacheStatus === 'HIT_L2').length;
    const misses = results.filter((r) => r.cacheStatus === 'MISS_FETCH').length;
    if (unique.length > 1) {
      const emoji = misses > 0 ? E.API_CALL : E.CACHE_L1;
      log(`${emoji} Quotes batch symbols=${unique.length} | L1=${hitsL1} L2=${hitsL2} API=${misses} | took=${took}ms`, {
        requestId,
      });
    }
    return {
      quotes: results,
      stats: { hitsL1, hitsL2, misses },
    };
  }

  private async getFromL2(key: string): Promise<{ value: unknown; fetchedAt: number; expiresAt: number } | null> {
    const doc = await PriceCacheModel.findOne({ key }).lean().exec();
    if (!doc?.value) return null;
    return {
      value: doc.value,
      fetchedAt: new Date(doc.fetchedAt).getTime(),
      expiresAt: new Date(doc.expiresAt).getTime(),
    };
  }

  private setL1(
    key: string,
    value: QuoteItem | CandlesResponse,
    type: 'QUOTE' | 'HISTORICAL',
    meta: { symbol: string; interval?: string; range?: string },
  ): void {
    const fetchedAt = now();
    const isQuote = type === 'QUOTE';
    const ttlMs = isQuote
      ? isHot(meta.symbol)
        ? TTL_QUOTE_HOT_MS
        : TTL_QUOTE_NORMAL_MS
      : TTL_HISTORICAL_MS;
    const expiresAt = fetchedAt + ttlMs;
    const staleAt = fetchedAt + Math.floor(ttlMs * STALE_RATIO);
    L1.set(key, {
      value,
      fetchedAt,
      expiresAt,
      staleAt,
      source: 'HIT_L2',
      meta: { ...meta, type },
    });
  }

  private async fetchAndSetQuotes(
    symbols: string[],
    requestId?: string,
  ): Promise<QuoteWithStatus[]> {
    const promise = (async () => {
      try {
        statsMisses++;
        log(`${E.API_CALL} API EXTERNA (Yahoo) symbols=${symbols.join(',')}`, { requestId });
        const list = await this.options.fetchQuotes(symbols);
        const start = now();
        for (const item of list) {
          const k = quoteKey(item.symbol);
          const fetchedAt = now();
          const ttlMs = isHot(item.symbol) ? TTL_QUOTE_HOT_MS : TTL_QUOTE_NORMAL_MS;
          const expiresAt = fetchedAt + ttlMs;
          const staleAt = fetchedAt + Math.floor(ttlMs * STALE_RATIO);
          L1.set(k, {
            value: item,
            fetchedAt,
            expiresAt,
            staleAt,
            source: 'MISS_FETCH',
            meta: { symbol: item.symbol, type: 'QUOTE' },
          });
          await this.setL2(k, item, 'QUOTE', { symbol: item.symbol }, expiresAt, staleAt);
        }
        log(`${E.DONE} refresh=DONE symbols=${symbols.length} took=${now() - start}ms`, { requestId });
        return list;
      } finally {
        for (const s of symbols) inFlight.delete(quoteKey(s));
      }
    })();
    for (const s of symbols) inFlight.set(quoteKey(s), promise);
    const list = await promise;
    return list.map((item) => ({
      ...item,
      fetchedAt: now(),
      cacheStatus: 'MISS_FETCH' as const,
    }));
  }

  private async refreshQuoteInBackground(symbol: string): Promise<void> {
    const key = quoteKey(symbol);
    if (inFlight.has(key)) return;
    const promise = (async () => {
      try {
        const list = await this.options.fetchQuotes([symbol]);
        const item = list[0];
        if (item) {
          const fetchedAt = now();
          const ttlMs = isHot(symbol) ? TTL_QUOTE_HOT_MS : TTL_QUOTE_NORMAL_MS;
          const expiresAt = fetchedAt + ttlMs;
          const staleAt = fetchedAt + Math.floor(ttlMs * STALE_RATIO);
          L1.set(key, {
            value: item,
            fetchedAt,
            expiresAt,
            staleAt,
            source: 'MISS_FETCH',
            meta: { symbol: item.symbol, type: 'QUOTE' },
          });
          await this.setL2(key, item, 'QUOTE', { symbol: item.symbol }, expiresAt, staleAt);
          log(`${E.DONE} refresh=DONE ${key} newPrice=${item.price}`, {});
        }
      } finally {
        inFlight.delete(key);
      }
    })();
    inFlight.set(key, promise);
  }

  private async setL2(
    key: string,
    value: unknown,
    type: 'QUOTE' | 'HISTORICAL',
    meta: { symbol: string; interval?: string; range?: string },
    expiresAt: number,
    staleAt: number,
  ): Promise<void> {
    await PriceCacheModel.findOneAndUpdate(
      { key },
      {
        $set: {
          value,
          fetchedAt: new Date(),
          expiresAt: new Date(expiresAt),
          staleAt: new Date(staleAt),
          meta: { ...meta, type },
        },
      },
      { upsert: true, new: true },
    ).exec();
  }

  /** Histórico (velas): L1 → L2 → provider. */
  async getHistorical(
    symbol: string,
    interval: string,
    range: string,
    strategy: CacheStrategy = 'swr',
    requestId?: string,
  ): Promise<{ data: CandlesResponse; cacheStatus: CacheStatus }> {
    const key = historicalKey(symbol, interval, range);
    const l1Entry = L1.get(key) as L1Entry<CandlesResponse> | undefined;

    if (l1Entry && now() < l1Entry.expiresAt && strategy !== 'network-first') {
      const age = (now() - l1Entry.fetchedAt) / 1000;
      if (now() < l1Entry.staleAt) {
        statsHitsL1++;
        log(`${E.CACHE_L1} CACHÉ L1 (sin API) ${key} age=${age}s`, { requestId });
        return { data: l1Entry.value, cacheStatus: 'HIT_L1' };
      }
      if (strategy === 'swr') {
        statsHitsL1++;
        log(`${key} STALE_SERVED age=${age}s refresh=START`, { requestId });
        this.refreshHistoricalInBackground(symbol, interval, range).catch(() => {});
        return { data: l1Entry.value, cacheStatus: 'STALE_SERVED_REFRESHING' };
      }
    }

    const existing = inFlight.get(key);
    if (existing) {
      const data = (await existing) as CandlesResponse;
      return { data, cacheStatus: 'INFLIGHT_JOINED' };
    }

    const fromL2 = await this.getFromL2(key);
    if (fromL2 && now() < fromL2.expiresAt) {
      statsHitsL2++;
      const value = fromL2.value as CandlesResponse;
      L1.set(key, {
        value,
        fetchedAt: fromL2.fetchedAt,
        expiresAt: fromL2.expiresAt,
        staleAt: fromL2.fetchedAt + Math.floor(TTL_HISTORICAL_MS * STALE_RATIO),
        source: 'HIT_L2',
        meta: { symbol, type: 'HISTORICAL', interval, range },
      });
      return { data: value, cacheStatus: 'HIT_L2' };
    }

    statsMisses++;
    log(`${E.API_CALL} API EXTERNA (Yahoo) ${key}`, { requestId });
    const promise = this.options
      .fetchCandles(symbol, interval, range)
      .then((data) => {
        const fetchedAt = now();
        const expiresAt = fetchedAt + TTL_HISTORICAL_MS;
        const staleAt = fetchedAt + Math.floor(TTL_HISTORICAL_MS * STALE_RATIO);
        L1.set(key, {
          value: data,
          fetchedAt,
          expiresAt,
          staleAt,
          source: 'MISS_FETCH',
          meta: { symbol, type: 'HISTORICAL', interval, range },
        });
        return this.setL2(key, data, 'HISTORICAL', { symbol, interval, range }, expiresAt, staleAt).then(
          () => data,
        );
      })
      .finally(() => {
        inFlight.delete(key);
      });
    inFlight.set(key, promise);
    const data = await promise;
    return { data, cacheStatus: 'MISS_FETCH' };
  }

  private async refreshHistoricalInBackground(
    symbol: string,
    interval: string,
    range: string,
  ): Promise<void> {
    const key = historicalKey(symbol, interval, range);
    if (inFlight.has(key)) return;
    const promise = this.options
      .fetchCandles(symbol, interval, range)
      .then((data) => {
        const fetchedAt = now();
        const expiresAt = fetchedAt + TTL_HISTORICAL_MS;
        const staleAt = fetchedAt + Math.floor(TTL_HISTORICAL_MS * STALE_RATIO);
        L1.set(key, {
          value: data,
          fetchedAt,
          expiresAt,
          staleAt,
          source: 'MISS_FETCH',
          meta: { symbol, type: 'HISTORICAL', interval, range },
        });
        return this.setL2(key, data, 'HISTORICAL', { symbol, interval, range }, expiresAt, staleAt);
      })
      .finally(() => {
        inFlight.delete(key);
      });
    inFlight.set(key, promise);
  }

  getStats(): PriceCacheStats {
    return {
      hitsL1: statsHitsL1,
      hitsL2: statsHitsL2,
      misses: statsMisses,
      inflightCount: inFlight.size,
      sizeL1: L1.size,
    };
  }

  /** Warmup: prellenar caché para HOT_SYMBOLS (network-first). */
  async warmupHotSymbols(requestId?: string): Promise<{ warmed: number; errors: string[] }> {
    const errors: string[] = [];
    let warmed = 0;
    const concurrency = 2;
    const queue = [...HOT_SYMBOLS];
    const run = async (): Promise<void> => {
      while (queue.length > 0) {
        const symbol = queue.shift();
        if (!symbol) break;
        try {
          await this.getQuotes([symbol], 'network-first', requestId);
          warmed++;
        } catch (e) {
          errors.push(`${symbol}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    };
    await Promise.all([run(), run()]);
    log(`${E.WARMUP} warmup done warmed=${warmed} errors=${errors.length}`, { requestId });
    return { warmed, errors };
  }
}
