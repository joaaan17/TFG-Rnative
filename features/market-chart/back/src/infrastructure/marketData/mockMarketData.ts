import type { MarketDataProvider } from '../../domain/ports';
import type { Candle } from '../../domain/market-chart.types';

function generateMockCandles(count: number, seed: number): Candle[] {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const candles: Candle[] = [];
  let close = 100;

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * day;
    const change =
      (Math.sin((i + seed) * 0.3) * 2 + (Math.random() - 0.5)) * 1.5;
    const open = close;
    close = Math.max(50, Math.min(200, close + change));
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000),
    });
  }

  return candles;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getCandles(
    _symbol: string,
    _interval: string,
    _from: number,
    _to: number,
  ): Promise<Candle[]> {
    return generateMockCandles(60, 42);
  }
}
