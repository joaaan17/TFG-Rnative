import type { Candle, IndicatorSeries } from './market-chart.types';

export interface MarketDataProvider {
  getCandles(
    symbol: string,
    interval: string,
    from: number,
    to: number,
  ): Promise<Candle[]>;
}

export interface IndicatorCalculator {
  calculateRSI(candles: Candle[]): IndicatorSeries;
  calculateMACD(candles: Candle[]): IndicatorSeries;
}
