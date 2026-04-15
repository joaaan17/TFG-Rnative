import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQuotes } from '../api/marketQuotesClient';
import type { PortfolioHolding } from '../api/investmentsClient';

export interface HoldingWithPrice extends PortfolioHolding {
  currentPrice?: number;
  currentValue?: number;
  changePercent?: number;
  /** true when currentPrice comes from avgBuyPrice (market quote unavailable). */
  isFallbackPrice?: boolean;
}

export function useHoldingsWithPrices(
  holdings: PortfolioHolding[] | undefined,
) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const symbols = useMemo(
    () => [...new Set((holdings ?? []).map((h) => h.symbol.toUpperCase()))],
    [holdings],
  );

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (symbols.length === 0) {
      setPrices({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    getQuotes(symbols)
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        (res.quotes ?? []).forEach((q) => {
          if (q.symbol && q.price != null)
            map[q.symbol.toUpperCase()] = q.price;
        });
        setPrices(map);
      })
      .catch(() => {
        if (!cancelled) setPrices({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbols.join(','), refreshKey]);

  const holdingsWithPrice: HoldingWithPrice[] = useMemo(() => {
    if (!holdings?.length) return [];
    return holdings.map((h) => {
      const sym = h.symbol.toUpperCase();
      const marketPrice = prices[sym];
      const hasMarketPrice = marketPrice != null && Number.isFinite(marketPrice);
      const currentPrice = hasMarketPrice
        ? marketPrice
        : h.avgBuyPrice > 0
          ? h.avgBuyPrice
          : undefined;
      const isFallbackPrice = !hasMarketPrice && currentPrice != null;
      const currentValue =
        currentPrice != null
          ? Math.round(h.shares * currentPrice * 100) / 100
          : undefined;
      const changePercent =
        hasMarketPrice && h.avgBuyPrice > 0
          ? Math.round(
              ((marketPrice - h.avgBuyPrice) / h.avgBuyPrice) * 10000,
            ) / 100
          : undefined;
      return {
        ...h,
        currentPrice,
        currentValue,
        changePercent,
        isFallbackPrice,
      };
    });
  }, [holdings, prices]);

  const totalValue = useMemo(() => {
    return holdingsWithPrice.reduce((sum, h) => sum + (h.currentValue ?? 0), 0);
  }, [holdingsWithPrice]);

  return { holdingsWithPrice, totalValue, loading, refetch };
}
