import { Platform } from 'react-native';
import { env } from '@/config/env';

function getMarketBaseUrl(): string {
  const base =
    env.apiUrl && env.apiUrl !== 'https://api.example.com'
      ? env.apiUrl.replace(/\/$/, '')
      : Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
  return `${base}/api/market`;
}

export interface QuoteItem {
  symbol: string;
  name: string;
  price?: number;
  currency?: string;
  /** URL de logo (opcional; si la API la devuelve, se usa en el avatar del listado). */
  logoUrl?: string;
}

export interface MarketQuotesResponse {
  quotes: QuoteItem[];
}

export async function getQuotes(
  symbols: string[],
): Promise<MarketQuotesResponse> {
  if (symbols.length === 0) return { quotes: [] };
  const params = new URLSearchParams({
    symbols: symbols.join(','),
  });
  const url = `${getMarketBaseUrl()}/quotes?${params.toString()}`;
  const response = await fetch(url);

  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    // malformed JSON
  }

  if (!response.ok) {
    if (Array.isArray(data?.quotes)) {
      return { quotes: data.quotes as MarketQuotesResponse['quotes'] };
    }
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al cargar cotizaciones';
    throw new Error(message);
  }

  return (data as unknown as MarketQuotesResponse) ?? { quotes: [] };
}
