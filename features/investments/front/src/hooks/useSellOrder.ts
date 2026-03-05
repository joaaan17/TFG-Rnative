import { useCallback, useRef, useState } from 'react';
import {
  postSellOrder,
  type SellOrderResponse,
} from '../api/investmentsClient';

export function useSellOrder(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (
      symbol: string,
      shares: number,
      options?: {
        onSuccess?: (result: SellOrderResponse) => void;
        price?: number;
      },
    ): Promise<SellOrderResponse | null> => {
      if (!token?.trim()) {
        setError('Debes iniciar sesión para vender');
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await postSellOrder(
          token,
          symbol,
          shares,
          options?.price,
        );
        if (mountedRef.current) {
          options?.onSuccess?.(result);
          return result;
        }
        return null;
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err.message : 'Error al ejecutar la venta',
          );
        }
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [token],
  );

  const clearError = useCallback(() => setError(null), []);

  return { execute, loading, error, clearError };
}
