import { useCallback, useEffect, useRef, useState } from 'react';
import { getCandles } from '../api/marketCandlesClient';

/** Mapa símbolo → array de precios de cierre para minigráficos. Refresco cada 5 min. */
const REFRESH_MS = 5 * 60 * 1000;

export function useHoldingsSparklines(symbols: string[], enabled: boolean) {
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    if (!enabled || symbols.length === 0) {
      setSparklines({});
      return;
    }
    const unique = [
      ...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
    ];
    const results = await Promise.allSettled(
      unique.map((symbol) =>
        getCandles(symbol, '1d', '1mo').then((res) => ({
          symbol,
          closes: (res.candles ?? [])
            .map((c) => c.c)
            .filter((n) => Number.isFinite(n)),
        })),
      ),
    );
    if (!mountedRef.current) return;
    const next: Record<string, number[]> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.closes.length >= 2) {
        next[r.value.symbol] = r.value.closes;
      }
    });
    setSparklines((prev) =>
      Object.keys(next).length === 0 ? prev : { ...prev, ...next },
    );
  }, [symbols.join(','), enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      setSparklines({});
      return;
    }
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_MS);
    return () => clearInterval(interval);
  }, [enabled, fetchAll]);

  return sparklines;
}
