/**
 * Tipos del frontend, alineados con el backend.
 * No usar tipos de TradingView aquí.
 */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface IndicatorSeries {
  name: string;
  values: Array<{ time: number; value: number }>;
}

export interface MarketChartData {
  candles: Candle[];
  indicators: IndicatorSeries[];
}
