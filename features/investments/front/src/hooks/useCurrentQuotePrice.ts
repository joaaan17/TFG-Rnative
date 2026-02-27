import { useCallback, useEffect, useRef, useState } from 'react';
import { getQuotes } from '../api/marketQuotesClient';

/**
 * Precio actual del símbolo desde GET /api/market/quotes (misma fuente que compra/venta).
 * Fuente única para: Valor actual en modal, Beneficios no realizados, línea de precio del gráfico
 * y cards de posiciones (useHoldingsWithPrices). Evita que el precio varíe según el timeframe
 * de velas (6h/1D/1M) y garantiza coherencia con el precio de ejecución de órdenes.
 * @param refreshIntervalMs - Intervalo de refresco en ms (por defecto 30s; en modal se puede usar 10s para valor lo más actualizado posible).
 */
const DEFAULT_REFRESH_INTERVAL_MS = 30_000;

export function useCurrentQuotePrice(
  symbol: string,
  enabled: boolean,
  refreshIntervalMs: number = DEFAULT_REFRESH_INTERVAL_MS,
) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchPrice = useCallback(async () => {
    if (!symbol?.trim() || !enabled) return;
    setLoading(true);
    try {
      const res = await getQuotes([symbol.trim().toUpperCase()]);
      const item = (res.quotes ?? []).find(
        (q) => (q.symbol ?? '').toUpperCase() === symbol.trim().toUpperCase(),
      );
      if (mountedRef.current && item?.price != null && Number.isFinite(item.price)) {
        setPrice(item.price);
      } else if (mountedRef.current) {
        setPrice(null);
      }
    } catch {
      if (mountedRef.current) setPrice(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [symbol, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled || !symbol?.trim()) {
      setPrice(null);
      setLoading(false);
      return;
    }
    fetchPrice();
    const interval = refreshIntervalMs > 0 ? refreshIntervalMs : DEFAULT_REFRESH_INTERVAL_MS;
    const intervalId = setInterval(fetchPrice, interval);
    return () => clearInterval(intervalId);
  }, [enabled, symbol, fetchPrice, refreshIntervalMs]);

  return { price, loading, refetch: fetchPrice };
}
