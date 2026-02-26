import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCandles,
  type CandleRange,
  type CandleInterval,
  type MarketCandlesResponse,
} from '../api/marketCandlesClient';

export function useMarketCandles(
  symbol: string,
  range: CandleRange = '1mo',
  interval: CandleInterval = '1d',
  enabled: boolean,
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
    try {
      const result = await getCandles(symbol, range, interval, signal);
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
  }, [symbol, range, interval, enabled]);

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
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, symbol, range, interval, fetchCandles]);

  const refetch = useCallback(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { data, loading, error, refetch };
}
