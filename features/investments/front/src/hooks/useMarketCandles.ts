import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCandles,
  type CandleRange,
  type CandleTimeframe,
  type MarketCandlesResponse,
} from '../api/marketCandlesClient';

export function useMarketCandles(
  symbol: string,
  timeframe: CandleTimeframe,
  enabled: boolean,
  range?: CandleRange,
) {
  const [data, setData] = useState<MarketCandlesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCandles = useCallback(async () => {
    if (!symbol.trim() || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setLoading(true);
    setError(null);
    setData((prev) => {
      if (!prev) return null;
      if (
        prev.symbol !== symbol.trim().toUpperCase() ||
        prev.timeframe !== timeframe
      ) {
        return null;
      }
      return prev;
    });
    try {
      const result = await getCandles(symbol, timeframe, range, signal);
      if (!signal.aborted && mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!signal.aborted && mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar velas');
      }
    } finally {
      if (!signal.aborted && mountedRef.current) {
        setLoading(false);
      }
      abortRef.current = null;
    }
  }, [symbol, timeframe, range, enabled]);

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
    fetchCandles();
    const intervalMs = 5 * 60 * 1000; // Gráfico: actualización cada 5 minutos
    const intervalId = setInterval(fetchCandles, intervalMs);
    return () => {
      clearInterval(intervalId);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, symbol, timeframe, range, fetchCandles]);

  const refetch = useCallback(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { data, loading, error, refetch };
}
