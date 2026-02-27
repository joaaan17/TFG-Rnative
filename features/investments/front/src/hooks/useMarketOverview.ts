import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getOverview,
  type MarketOverviewResponse,
} from '../api/marketOverviewClient';

export function useMarketOverview(symbol: string, enabled: boolean) {
  const [data, setData] = useState<MarketOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!symbol.trim() || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setLoading(true);
    setError(null);
    try {
      const result = await getOverview(symbol, signal);
      if (!signal.aborted && mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!signal.aborted && mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      }
    } finally {
      if (!signal.aborted && mountedRef.current) {
        setLoading(false);
      }
      abortRef.current = null;
    }
  }, [symbol, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !symbol.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    fetchOverview();
    const intervalMs = 5 * 60 * 1000; // Backend con L1/L2; refetch cada 5 min
    const intervalId = setInterval(fetchOverview, intervalMs);
    return () => {
      clearInterval(intervalId);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, symbol, fetchOverview]);

  const refetch = useCallback(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch };
}
