import { Platform } from 'react-native';

function getMarketBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market';
  return 'http://localhost:3000/api/market';
}

export interface QuoteSnapshot {
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  marketCap: number | null;
  currency: string | null;
}

export interface FundamentalsSnapshot {
  pe: number | null;
  eps: number | null;
  quickRatio: number | null;
  beta: number | null;
  marketCap: number | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
}

export interface MarketOverviewResponse {
  symbol: string;
  asOf: number;
  quote: QuoteSnapshot;
  fundamentals: FundamentalsSnapshot;
}

export async function getOverview(
  symbol: string,
  signal?: AbortSignal,
): Promise<MarketOverviewResponse> {
  const params = new URLSearchParams({
    symbol: symbol.trim().toUpperCase(),
  });
  const url = `${getMarketBaseUrl()}/overview?${params.toString()}`;
  const response = await fetch(url, { signal });
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al cargar datos';
    throw new Error(message);
  }

  return data as MarketOverviewResponse;
}
