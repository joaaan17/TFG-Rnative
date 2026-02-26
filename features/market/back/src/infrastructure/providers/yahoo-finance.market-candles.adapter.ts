import type { MarketCandlesPort } from '../../domain/market.ports';
import type {
  Candle,
  CandleInterval,
  CandleRange,
} from '../../domain/market.types';

const CANDLES_TIMEOUT_MS = 8_000;

/** period1/period2 en ms para cada range (desde ahora hacia atrás). */
function rangeToPeriods(
  range: CandleRange,
): { period1: Date; period2: Date } {
  const now = Date.now();
  const period2 = new Date(now);
  let period1: Date;
  switch (range) {
    case '1d':
      period1 = new Date(now - 1 * 24 * 60 * 60 * 1000);
      break;
    case '5d':
      period1 = new Date(now - 5 * 24 * 60 * 60 * 1000);
      break;
    case '1wk':
      period1 = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1mo':
      period1 = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3mo':
      period1 = new Date(now - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6mo':
      period1 = new Date(now - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      period1 = new Date(now - 365 * 24 * 60 * 60 * 1000);
      break;
    case '2y':
      period1 = new Date(now - 2 * 365 * 24 * 60 * 60 * 1000);
      break;
    case '5y':
      period1 = new Date(now - 5 * 365 * 24 * 60 * 60 * 1000);
      break;
    case 'max':
      period1 = new Date(2000, 0, 1);
      break;
    default:
      period1 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
  return { period1, period2 };
}

/** Intervalo de dominio -> opción chart de Yahoo (algunos no existen, usamos los que sí). */
function toYahooInterval(interval: CandleInterval): string {
  const map: Record<CandleInterval, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '1d': '1d',
    '1wk': '1wk',
    '1mo': '1mo',
  };
  return map[interval] ?? '1d';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`Candles request timeout after ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

export class YahooFinanceMarketCandlesAdapter implements MarketCandlesPort {
  async getCandles(
    symbol: string,
    range: CandleRange,
    interval: CandleInterval,
  ): Promise<Candle[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createYahooFinance =
      require('yahoo-finance2/createYahooFinance').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chartModule = require('yahoo-finance2/modules/chart').default;
    const YahooFinanceClass = createYahooFinance({
      modules: { chart: chartModule },
    });
    const client = new YahooFinanceClass();

    const { period1, period2 } = rangeToPeriods(range);
    const yahooInterval = toYahooInterval(interval);

    const raw = await withTimeout(
      client.chart(symbol, {
        period1,
        period2,
        interval: yahooInterval as '1d' | '1wk' | '1mo' | '1h' | '5m',
      }),
      CANDLES_TIMEOUT_MS,
    );

    const quotes =
      raw && typeof raw === 'object' && Array.isArray((raw as { quotes?: unknown[] }).quotes)
        ? (raw as { quotes: Array<{ date: Date; open: number | null; high: number | null; low: number | null; close: number | null; volume?: number | null }> }).quotes
        : [];

    const candles: Candle[] = [];
    for (const q of quotes) {
      const t = q.date instanceof Date ? q.date.getTime() : 0;
      const o = typeof q.open === 'number' ? q.open : 0;
      const h = typeof q.high === 'number' ? q.high : 0;
      const l = typeof q.low === 'number' ? q.low : 0;
      const c = typeof q.close === 'number' ? q.close : 0;
      const v =
        q.volume != null && Number.isFinite(q.volume) ? q.volume : undefined;
      if (t > 0 && (o > 0 || c > 0)) {
        candles.push({ t, o, h, l, c, v });
      }
    }

    candles.sort((a, b) => a.t - b.t);
    return candles;
  }
}
