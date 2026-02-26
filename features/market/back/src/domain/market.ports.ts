import type {
  Candle,
  CandleInterval,
  CandleRange,
  MarketSearchResult,
} from './market.types';

/**
 * Port para búsqueda de activos/acciones.
 * La infraestructura (ej. Yahoo) implementa este port.
 */
export interface MarketSearchPort {
  search(query: string, limit: number): Promise<MarketSearchResult[]>;
}

/**
 * Port para histórico de velas.
 * La infraestructura (ej. Yahoo chart) implementa este port.
 */
export interface MarketCandlesPort {
  getCandles(
    symbol: string,
    range: CandleRange,
    interval: CandleInterval,
  ): Promise<Candle[]>;
}
