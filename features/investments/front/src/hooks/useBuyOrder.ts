import { useCallback, useRef, useState } from 'react';
import { postBuyOrder, type BuyOrderResponse } from '../api/investmentsClient';

export function useBuyOrder(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (
      symbol: string,
      shares: number,
      onSuccess?: (result: BuyOrderResponse) => void,
    ): Promise<BuyOrderResponse | null> => {
      if (!token?.trim()) {
        setError('Debes iniciar sesión para comprar');
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await postBuyOrder(token, symbol, shares);
        if (mountedRef.current) {
          onSuccess?.(result);
          return result;
        }
        return null;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Error al ejecutar la compra');
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
