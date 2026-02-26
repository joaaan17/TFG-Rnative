import type { MarketCandlesPort } from '../../domain/market.ports';
import type {
  Candle,
  CandleInterval,
  CandleRange,
} from '../../domain/market.types';

const DEFAULT_RANGE: CandleRange = '1mo';
const DEFAULT_INTERVAL: CandleInterval = '1d';
const MAX_SYMBOL_LENGTH = 15;

const VALID_RANGES: CandleRange[] = [
  '1d',
  '5d',
  '1wk',
  '1mo',
  '3mo',
  '6mo',
  '1y',
  '2y',
  '5y',
  'max',
];
const VALID_INTERVALS: CandleInterval[] = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '1d',
  '1wk',
  '1mo',
];

function isValidNumber(n: number): boolean {
  return Number.isFinite(n) && !Number.isNaN(n);
}

export class GetCandlesUseCase {
  constructor(private readonly candlesPort: MarketCandlesPort) {}

  async execute(input: {
    symbol: string;
    range?: CandleRange;
    interval?: CandleInterval;
  }): Promise<Candle[]> {
    const raw = typeof input.symbol === 'string' ? input.symbol.trim() : '';
    const symbol = raw.toUpperCase();
    if (!symbol) {
      throw new Error('symbol is required');
    }
    if (symbol.length > MAX_SYMBOL_LENGTH) {
      throw new Error(`symbol must be at most ${MAX_SYMBOL_LENGTH} characters`);
    }

    const range =
      input.range != null && VALID_RANGES.includes(input.range)
        ? input.range
        : DEFAULT_RANGE;
    const interval =
      input.interval != null && VALID_INTERVALS.includes(input.interval)
        ? input.interval
        : DEFAULT_INTERVAL;

    const candles = await this.candlesPort.getCandles(symbol, range, interval);

    return candles.filter(
      (c) =>
        isValidNumber(c.t) &&
        isValidNumber(c.o) &&
        isValidNumber(c.h) &&
        isValidNumber(c.l) &&
        isValidNumber(c.c),
    );
  }
}
