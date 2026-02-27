import { useEffect, useMemo, useState } from 'react';
import { getQuotes } from '../api/marketQuotesClient';
import type { PortfolioHolding } from '../api/investmentsClient';

export interface HoldingWithPrice extends PortfolioHolding {
  currentPrice?: number;
  currentValue?: number;
  changePercent?: number;
}

export function useHoldingsWithPrices(holdings: PortfolioHolding[] | undefined) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const symbols = useMemo(
    () => [...new Set((holdings ?? []).map((h) => h.symbol))],
    [holdings],
  );

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
          if (q.symbol && q.price != null) map[q.symbol.toUpperCase()] = q.price;
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
  }, [symbols.join(',')]);

  const holdingsWithPrice: HoldingWithPrice[] = useMemo(() => {
    if (!holdings?.length) return [];
    return holdings.map((h) => {
      const currentPrice = prices[h.symbol];
      const currentValue =
        currentPrice != null ? Math.round(h.shares * currentPrice * 100) / 100 : undefined;
      const changePercent =
        currentPrice != null && h.avgBuyPrice > 0
          ? Math.round(((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 10000) / 100
          : undefined;
      return {
        ...h,
        currentPrice,
        currentValue,
        changePercent,
      };
    });
  }, [holdings, prices]);

  const totalValue = useMemo(() => {
    return holdingsWithPrice.reduce(
      (sum, h) => sum + (h.currentValue ?? 0),
      0,
    );
  }, [holdingsWithPrice]);

  return { holdingsWithPrice, totalValue, loading };
}
