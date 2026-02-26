import { Platform } from 'react-native';

function getMarketBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market';
  return 'http://localhost:3000/api/market';
}

export interface QuoteItem {
  symbol: string;
  name: string;
  price?: number;
  currency?: string;
}

export interface MarketQuotesResponse {
  quotes: QuoteItem[];
}

export async function getQuotes(symbols: string[]): Promise<MarketQuotesResponse> {
  if (symbols.length === 0) return { quotes: [] };
  const params = new URLSearchParams({
    symbols: symbols.join(','),
  });
  const url = `${getMarketBaseUrl()}/quotes?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al cargar cotizaciones';
    throw new Error(message);
  }

  return data as MarketQuotesResponse;
}
