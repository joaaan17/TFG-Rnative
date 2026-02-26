import type { MarketSearchResult } from './market.types';

/**
 * Port para búsqueda de activos/acciones.
 * La infraestructura (ej. Yahoo) implementa este port.
 */
export interface MarketSearchPort {
  search(query: string, limit: number): Promise<MarketSearchResult[]>;
}
