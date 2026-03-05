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
  values: { time: number; value: number }[];
}

export interface MarketChartData {
  candles: Candle[];
  indicators: IndicatorSeries[];
}

/** Línea horizontal en un precio (soporte, resistencia, compra, etc.) */
export interface PriceLine {
  price: number;
  color?: string;
  lineWidth?: number;
  lineStyle?: number; // 0 sólida, 1 punteada, 2 discontinua
  title?: string;
  axisLabelVisible?: boolean;
}

/** Marcador en un punto temporal (noticia, compra, evento) */
export interface ChartMarker {
  time: number;
  position?: 'aboveBar' | 'belowBar' | 'inBar';
  color?: string;
  shape?: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  text?: string;
}
