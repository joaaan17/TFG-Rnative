import type { MarketCandlesPort } from '../../domain/market.ports';
import type {
  Candle,
  CandleInterval,
  CandleRange,
  CandleTimeframe,
  CandlesResponse,
} from '../../domain/market.types';

const MAX_CANDLES = 500;
const CACHE_TTL_MS = 30_000;
const MAX_SYMBOL_LENGTH = 15;

const VALID_TIMEFRAMES: CandleTimeframe[] = ['6h', '1d', '1mo'];

/** Rangos que el usuario puede elegir (periodo de visualización). */
const ALLOWED_RANGES: CandleRange[] = ['1wk', '1mo', '3mo', '6mo', '1y'];

/**
 * Yahoo Finance solo devuelve datos 1h para ~60 días. Para timeframe 6h (interval 1h)
 * no podemos pedir 6mo o 1y; limitamos a 3mo para obtener velas 1h y agregar a 6h.
 */
const MAX_RANGE_FOR_1H: CandleRange = '3mo';

/** Mapeo por defecto: timeframe -> (range, interval) cuando el usuario no elige rango. */
const TIMEFRAME_TO_RANGE_INTERVAL: Record<
  CandleTimeframe,
  { range: CandleRange; interval: CandleInterval }
> = {
  '6h': { range: '3mo', interval: '1h' },
  '1d': { range: '6mo', interval: '1d' },
  '1mo': { range: '5y', interval: '1mo' },
};

/** Intervalo de 6 horas en ms. */
const BUCKET_6H_MS = 6 * 60 * 60 * 1000;

interface CacheEntry {
  response: CandlesResponse;
  expiresAt: number;
}

function isValidNumber(n: number): boolean {
  return Number.isFinite(n) && !Number.isNaN(n);
}

/**
 * Agrega velas 1h a velas 6h (OHLCV).
 * t del bucket = inicio del bloque (primer timestamp del bloque).
 */
function aggregate1hTo6h(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];
  const byBucket = new Map<number, Candle[]>();
  for (const c of candles) {
    if (!isValidNumber(c.t) || !isValidNumber(c.o) || !isValidNumber(c.h) || !isValidNumber(c.l) || !isValidNumber(c.c)) {
      continue;
    }
    const bucketStart = Math.floor(c.t / BUCKET_6H_MS) * BUCKET_6H_MS;
    const list = byBucket.get(bucketStart) ?? [];
    list.push(c);
    byBucket.set(bucketStart, list);
  }
  const result: Candle[] = [];
  const sortedBuckets = Array.from(byBucket.keys()).sort((a, b) => a - b);
  for (const t of sortedBuckets) {
    const list = byBucket.get(t)!;
    list.sort((a, b) => a.t - b.t);
    const open = list[0].o;
    const close = list[list.length - 1].c;
    const high = Math.max(...list.map((c) => c.h));
    const low = Math.min(...list.map((c) => c.l));
    const volume = list.some((c) => c.v != null)
      ? list.reduce((sum, c) => sum + (c.v ?? 0), 0)
      : undefined;
    result.push({ t, o: open, h: high, l: low, c: close, v: volume });
  }
  return result;
}

export class GetCandlesByTimeframeUseCase {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly candlesPort: MarketCandlesPort) {}

  async execute(
    symbol: string,
    timeframe: CandleTimeframe,
    rangeOverride?: CandleRange,
  ): Promise<CandlesResponse> {
    const raw = typeof symbol === 'string' ? symbol.trim() : '';
    const sym = raw.toUpperCase();
    if (!sym) {
      throw new Error('symbol is required');
    }
    if (sym.length > MAX_SYMBOL_LENGTH) {
      throw new Error(`symbol must be at most ${MAX_SYMBOL_LENGTH} characters`);
    }
    if (!VALID_TIMEFRAMES.includes(timeframe)) {
      throw new Error(`timeframe must be one of: ${VALID_TIMEFRAMES.join(', ')}`);
    }

    const defaultMapping = TIMEFRAME_TO_RANGE_INTERVAL[timeframe];
    let range: CandleRange =
      rangeOverride != null && ALLOWED_RANGES.includes(rangeOverride)
        ? rangeOverride
        : defaultMapping.range;

    // Para velas 6h pedimos datos 1h al proveedor; Yahoo limita 1h a ~60 días.
    if (timeframe === '6h' && (range === '6mo' || range === '1y')) {
      range = MAX_RANGE_FOR_1H;
    }

    const interval = defaultMapping.interval;

    const cacheKey = `${sym}:${timeframe}:${range}`;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.response;
    }
    let candles = await this.candlesPort.getCandles(sym, range, interval);
    candles = candles.filter(
      (c) =>
        isValidNumber(c.t) &&
        isValidNumber(c.o) &&
        isValidNumber(c.h) &&
        isValidNumber(c.l) &&
        isValidNumber(c.c),
    );

    if (timeframe === '6h') {
      candles = aggregate1hTo6h(candles);
    }

    candles.sort((a, b) => a.t - b.t);
    if (candles.length > MAX_CANDLES) {
      candles = candles.slice(-MAX_CANDLES);
    }

    const response: CandlesResponse = {
      symbol: sym,
      timeframe,
      range,
      interval: timeframe,
      count: candles.length,
      candles,
    };

    this.cache.set(cacheKey, {
      response,
      expiresAt: now + CACHE_TTL_MS,
    });
    return response;
  }
}
