import { fetchMarketChart } from '../api/marketChartClient';
import type { MarketChartData } from '../types/market-chart.types';

export interface GetChartParams {
  symbol?: string;
  interval?: string;
  from?: number;
  to?: number;
}

export async function getMarketChart(
  params: GetChartParams = {},
): Promise<MarketChartData> {
  return fetchMarketChart(params);
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}
