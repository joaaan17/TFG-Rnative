import { Platform } from 'react-native';

function getMarketBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market';
  return 'http://localhost:3000/api/market';
}

/** Timeframe seleccionable: granularidad de vela (6h, 1d, 1mo). */
export type CandleTimeframe = '6h' | '1d' | '1mo';

/** Rango de visualización (periodo mostrado en el gráfico). */
export type CandleRange = '1wk' | '1mo' | '3mo' | '6mo' | '1y';

export interface ApiCandle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

/** Origen de los datos (caché L1/L2 o fetch). Para indicador visual en el gráfico. */
export type CacheStatusCandles =
  | 'HIT_L1'
  | 'HIT_L2'
  | 'MISS_FETCH'
  | 'STALE_SERVED_REFRESHING'
  | 'INFLIGHT_JOINED';

export interface MarketCandlesResponse {
  symbol: string;
  timeframe: CandleTimeframe;
  range: string;
  interval: CandleTimeframe;
  count: number;
  candles: ApiCandle[];
  /** Indica si los datos vienen de caché (L1/L2) o se acaban de pedir al proveedor. */
  cacheStatus?: CacheStatusCandles;
}

/**
 * Obtiene velas por timeframe y opcionalmente por range (periodo de visualización).
 * Si no se pasa range, el backend usa el rango por defecto del timeframe.
 */
export async function getCandles(
  symbol: string,
  timeframe: CandleTimeframe,
  range?: CandleRange,
  signal?: AbortSignal,
): Promise<MarketCandlesResponse> {
  const params = new URLSearchParams({
    symbol: symbol.trim().toUpperCase(),
    timeframe,
  });
  if (range) params.set('range', range);
  const url = `${getMarketBaseUrl()}/candles?${params.toString()}`;
  const response = await fetch(url, { signal });
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al cargar el histórico';
    throw new Error(message);
  }

  return data as MarketCandlesResponse;
}
