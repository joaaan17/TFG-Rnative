import type { IndicatorCalculator } from '../../domain/ports';
import type { Candle, IndicatorSeries } from '../../domain/market-chart.types';

function calculateRSIValues(candles: Candle[], period = 14): IndicatorSeries {
  const values: { time: number; value: number }[] = [];

  for (let i = period; i < candles.length; i++) {
    let gains = 0;
    let losses = 0;

    for (let j = i - period; j < i; j++) {
      const change = candles[j + 1].close - candles[j].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    values.push({ time: candles[i].time, value: Math.round(rsi * 100) / 100 });
  }

  return { name: 'RSI', values };
}

function calculateMACDValues(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signal = 9,
): IndicatorSeries {
  const closes = candles.map((c) => c.close);
  const ema = (arr: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const result: number[] = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
      result.push(arr[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  };

  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }
  const signalLine = ema(macdLine, signal);

  const values: { time: number; value: number }[] = [];
  for (let i = slow; i < candles.length; i++) {
    values.push({
      time: candles[i].time,
      value: Math.round((macdLine[i] - signalLine[i]) * 100) / 100,
    });
  }

  return { name: 'MACD', values };
}

export class SimpleIndicatorCalculator implements IndicatorCalculator {
  calculateRSI(candles: Candle[]): IndicatorSeries {
    return calculateRSIValues(candles);
  }

  calculateMACD(candles: Candle[]): IndicatorSeries {
    return calculateMACDValues(candles);
  }
}
