import { Platform } from 'react-native';
import type { MarketChartData } from '../types/market-chart.types';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/market-chart';
  return 'http://localhost:3000/api/market-chart';
}

export interface FetchChartParams {
  symbol?: string;
  interval?: string;
  from?: number;
  to?: number;
}

export async function fetchMarketChart(
  params: FetchChartParams = {},
): Promise<MarketChartData> {
  const { symbol = 'BTC', interval = '1d', from = 0, to } = params;
  const toVal = to ?? Math.floor(Date.now() / 1000);
  const url = `${getBaseUrl()}/chart?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&from=${from}&to=${toVal}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al obtener datos del gráfico';
    throw new Error(message);
  }

  return data as MarketChartData;
}
