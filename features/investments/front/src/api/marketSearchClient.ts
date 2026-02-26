import { Platform } from 'react-native';

function getMarketSearchBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market';
  return 'http://localhost:3000/api/market';
}

export interface MarketSearchResultItem {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
  currency?: string;
}

export interface MarketSearchResponse {
  query: string;
  count: number;
  results: MarketSearchResultItem[];
}

export async function searchMarket(
  q: string,
  limit: number = 10,
): Promise<MarketSearchResponse> {
  const query = q.trim();
  if (!query) {
    return { query: '', count: 0, results: [] };
  }

  const params = new URLSearchParams({ q: query });
  if (limit > 0) params.set('limit', String(Math.min(limit, 20)));

  const url = `${getMarketSearchBaseUrl()}/search?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al buscar acciones';
    throw new Error(message);
  }

  return data as MarketSearchResponse;
}
