/**
 * Tipos de dominio para Market (búsqueda de activos).
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
