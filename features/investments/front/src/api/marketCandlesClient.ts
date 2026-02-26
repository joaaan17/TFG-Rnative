import { Platform } from 'react-native';

function getMarketBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market';
  return 'http://localhost:3000/api/market';
}

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
export type CandleInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '1d'
  | '1wk'
  | '1mo';

export interface ApiCandle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

export interface MarketCandlesResponse {
  symbol: string;
  range: CandleRange;
  interval: CandleInterval;
  count: number;
  candles: ApiCandle[];
}

export async function getCandles(
  symbol: string,
  range: CandleRange = '1mo',
  interval: CandleInterval = '1d',
  signal?: AbortSignal,
): Promise<MarketCandlesResponse> {
  const params = new URLSearchParams({
    symbol: symbol.trim().toUpperCase(),
    range,
    interval,
  });
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
