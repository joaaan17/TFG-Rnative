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

/** Intervalo de velas (alineado con opciones de Yahoo). */
export type CandleInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '1d'
  | '1wk'
  | '1mo';

/** Rango de tiempo para histórico. */
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
}
