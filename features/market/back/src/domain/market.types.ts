/**
 * Tipos de dominio para Market (búsqueda de activos y velas).
 * El resto del sistema no depende de proveedores externos.
 */

export type MarketSearchResultType =
  | 'EQUITY'
  | 'ETF'
  | 'CRYPTO'
  | 'INDEX'
  | 'FUND'
  | 'FX'
  | 'UNKNOWN';

export interface MarketSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: MarketSearchResultType;
  currency?: string;
}

/** Intervalo de velas (granularidad soportada por el proveedor, ej. Yahoo). */
export type CandleInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '1d'
  | '1wk'
  | '1mo';

/** Rango de tiempo total mostrado en el histórico. */
export type CandleRange =
  | '1d'
  | '5d'
  | '1wk'
  | '1mo'
  | '3mo'
  | '6mo'
  | '1y'
  | '2y'
  | '5y'
  | 'max';

/**
 * Timeframe seleccionable por el usuario (granularidad de vela).
 * El backend mapea a (range, interval) y opcionalmente agrega (ej. 1h -> 6h).
 */
export type CandleTimeframe = '6h' | '1d' | '1mo';

/** Respuesta del endpoint de velas por timeframe. */
export interface CandlesResponse {
  symbol: string;
  timeframe: CandleTimeframe;
  range: CandleRange;
  /** Intervalo lógico de cada vela (6h, 1d o 1mo). */
  interval: CandleTimeframe;
  count: number;
  candles: Candle[];
}

/** Vela OHLC(V), t en unix milliseconds. */
export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

/** Cotización resumida para listados (nombre + precio). */
export interface QuoteItem {
  symbol: string;
  name: string;
  price?: number;
  currency?: string;
  /** URL de logo/favicon del emisor (opcional; si no viene, el front puede usar inicial o favicon por dominio). */
  logoUrl?: string;
}

/** Snapshot del día: OHLC + volumen + market cap (quote del día). */
export interface QuoteSnapshot {
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  marketCap: number | null;
  currency: string | null;
}

/** Fundamentales: ratios y perfil. */
export interface FundamentalsSnapshot {
  pe: number | null;
  eps: number | null;
  quickRatio: number | null;
  beta: number | null;
  marketCap: number | null;
  sector: string | null;
  industry: string | null;
}

/** Overview completo: quote del día + fundamentales. */
export interface MarketOverview {
  symbol: string;
  asOf: number;
  quote: QuoteSnapshot;
  fundamentals: FundamentalsSnapshot;
}
