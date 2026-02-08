/**
 * Tipos del dominio Market Chart.
 * Lenguaje de negocio, sin dependencias de TradingView ni librerías de gráficos.
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
