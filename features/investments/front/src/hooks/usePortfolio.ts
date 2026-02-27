import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPortfolio,
  type PortfolioResponse,
} from '../api/investmentsClient';

export function usePortfolio(token: string | null, enabled: boolean) {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!token?.trim() || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const result = await getPortfolio(token);
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar la cartera');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      abortRef.current = null;
    }
  }, [token, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !token?.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    fetchPortfolio();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [enabled, token, fetchPortfolio]);

  const refetch = useCallback(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { data, loading, error, refetch };
}
