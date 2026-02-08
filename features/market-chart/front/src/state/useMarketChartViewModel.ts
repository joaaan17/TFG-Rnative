import * as React from 'react';
import {
  getMarketChart,
  extractErrorMessage,
} from '../services/marketChartService';
import type { MarketChartData } from '../types/market-chart.types';

export function useMarketChartViewModel() {
  const [data, setData] = React.useState<MarketChartData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadChart = React.useCallback(
    async (params?: {
      symbol?: string;
      interval?: string;
      from?: number;
      to?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMarketChart(params ?? {});
        setData(result);
      } catch (err) {
        setError(extractErrorMessage(err, 'Error al cargar el gráfico'));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, loading, error, loadChart };
}
