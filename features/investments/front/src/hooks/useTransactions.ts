import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getTransactions,
  type TransactionResponse,
} from '../api/investmentsClient';

export function useTransactions(token: string | null, enabled: boolean, limit: number = 50) {
  const [data, setData] = useState<TransactionResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchTransactions = useCallback(async () => {
    if (!token?.trim() || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTransactions(token, limit);
      if (mountedRef.current) setData(result.transactions);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [token, enabled, limit]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled || !token?.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    fetchTransactions();
  }, [enabled, token, limit, fetchTransactions]);

  const refetch = useCallback(() => fetchTransactions(), [fetchTransactions]);

  return { data, loading, error, refetch };
}
