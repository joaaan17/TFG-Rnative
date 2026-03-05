import { useCallback, useState } from 'react';
import {
  getPerformance,
  type PerformanceRange,
  type PerformanceResponse,
} from '../api/investmentsClient';

type ChartMode = 'equity' | 'invested';

export function usePortfolioAnalytics(
  token: string | null,
  range: PerformanceRange,
) {
  const [performance, setPerformance] = useState<PerformanceResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<Record<ChartMode, boolean>>({
    equity: false,
    invested: false,
  });
  const [error, setError] = useState<Record<ChartMode, string | null>>({
    equity: null,
    invested: null,
  });

  const fetchPerformance = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, equity: true }));
    setError((e) => ({ ...e, equity: null }));
    try {
      const data = await getPerformance(token, range);
      setPerformance(data);
    } catch (err) {
      setError((e) => ({
        ...e,
        equity: err instanceof Error ? err.message : 'Error al cargar',
      }));
    } finally {
      setLoading((l) => ({ ...l, equity: false }));
    }
  }, [token, range]);

  const refetch = useCallback(
    (mode: ChartMode) => {
      if (mode === 'equity' || mode === 'invested') fetchPerformance();
    },
    [fetchPerformance],
  );

  return {
    performance,
    loading,
    error,
    fetchPerformance,
    refetch,
  };
}
