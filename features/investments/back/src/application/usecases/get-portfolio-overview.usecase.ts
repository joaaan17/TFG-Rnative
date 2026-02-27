import type { PortfolioRepository, TransactionRepository } from '../../domain/ports';
import type { GetQuotesPort } from '../../domain/ports';
import type {
  AllocationItem,
  PortfolioOverview,
  PortfolioMarker,
  Holding,
  Transaction,
} from '../../domain/investments.types';

const TOP_N = 6;
const OTHERS_SYMBOL = 'OTHERS';

export type TimeframeParam = '6h' | '1d' | '1mo';
export type RangeParam = '1wk' | '1mo' | '3mo' | '6mo' | '1y';

function rangeToMs(range: RangeParam): number {
  const map: Record<RangeParam, number> = {
    '1wk': 7 * 24 * 60 * 60 * 1000,
    '1mo': 30 * 24 * 60 * 60 * 1000,
    '3mo': 90 * 24 * 60 * 60 * 1000,
    '6mo': 180 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  return map[range] ?? map['6mo'];
}

/** Agrupa transacciones por bucket según timeframe. Devuelve timestamp en ms (inicio del bucket). */
function bucketKey(d: Date, timeframe: TimeframeParam): number {
  const t = d.getTime();
  if (timeframe === '1d') {
    const day = new Date(d);
    day.setUTCHours(0, 0, 0, 0);
    return day.getTime();
  }
  if (timeframe === '1mo') {
    const month = new Date(d);
    month.setUTCDate(1);
    month.setUTCHours(0, 0, 0, 0);
    return month.getTime();
  }
  // 6h: bucket de 6 horas (0, 6, 12, 18 UTC)
  const h = d.getUTCHours();
  const bucketHour = Math.floor(h / 6) * 6;
  const bucket = new Date(d);
  bucket.setUTCHours(bucketHour, 0, 0, 0);
  return bucket.getTime();
}

export class GetPortfolioOverviewUseCase {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly getQuotes: GetQuotesPort,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    userId: string,
    timeframe: TimeframeParam = '1d',
    range: RangeParam = '6mo',
  ): Promise<PortfolioOverview> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) throw new Error('userId is required');

    const portfolio = await this.portfolioRepository.findByUserId(uid);
    if (!portfolio) {
      return {
        totalValue: 0,
        allocation: [],
        markers: [],
      };
    }

    const [allocation, markers] = await Promise.all([
      this.computeAllocation(portfolio),
      this.computeMarkers(uid, portfolio.holdings, timeframe, range),
    ]);

    const finalTotal = Math.round(allocation.reduce((sum, a) => sum + a.value, 0) * 100) / 100;

    return {
      totalValue: finalTotal,
      allocation,
      markers,
    };
  }

  private async computeAllocation(portfolio: {
    cashBalance: number;
    holdings: Holding[];
  }): Promise<AllocationItem[]> {
    const { cashBalance, holdings } = portfolio;
    if (!holdings.length) {
      if (cashBalance > 0) {
        return [
          {
            symbol: 'CASH',
            name: 'Efectivo',
            value: Math.round(cashBalance * 100) / 100,
            weight: 1,
          },
        ];
      }
      return [];
    }

    const symbols = holdings.map((h) => h.symbol.trim().toUpperCase());
    const quotes = await this.getQuotes.getQuotes(symbols);
    const priceBySymbol: Record<string, number> = {};
    quotes.forEach((q: { symbol: string; price: number | null }) => {
      if (q.price != null && Number.isFinite(q.price)) {
        priceBySymbol[q.symbol] = q.price;
      }
    });

    const items: AllocationItem[] = holdings
      .map((h) => {
        const sym = h.symbol.trim().toUpperCase();
        const price = priceBySymbol[sym] ?? 0;
        const value = Math.round(h.shares * price * 100) / 100;
        return { symbol: sym, name: sym, value, weight: 0 };
      })
      .filter((a) => a.value > 0);

    const totalFromHoldings = items.reduce((s, a) => s + a.value, 0);
    const totalValue = cashBalance + totalFromHoldings;
    if (totalValue <= 0) return [];

    const result: AllocationItem[] = [];
    if (cashBalance > 0) {
      result.push({
        symbol: 'CASH',
        name: 'Efectivo',
        value: Math.round(cashBalance * 100) / 100,
        weight: Math.round((cashBalance / totalValue) * 10000) / 10000,
      });
    }
    items.sort((a, b) => b.value - a.value);
    const top = items.slice(0, TOP_N);
    const rest = items.slice(TOP_N);
    const othersValue = Math.round(rest.reduce((s, a) => s + a.value, 0) * 100) / 100;

    top.forEach((a) => {
      result.push({
        ...a,
        weight: Math.round((a.value / totalValue) * 10000) / 10000,
      });
    });
    if (othersValue > 0) {
      result.push({
        symbol: OTHERS_SYMBOL,
        name: 'Otros',
        value: othersValue,
        weight: Math.round((othersValue / totalValue) * 10000) / 10000,
      });
    }

    const sumWeight = result.reduce((s, a) => s + a.weight, 0);
    if (sumWeight > 0 && Math.abs(sumWeight - 1) > 0.0001 && result.length > 0) {
      const last = result[result.length - 1];
      last.weight = Math.round((1 - (sumWeight - last.weight)) * 10000) / 10000;
    }

    return result;
  }

  private async computeMarkers(
    userId: string,
    _holdings: Holding[],
    timeframe: TimeframeParam,
    range: RangeParam,
  ): Promise<PortfolioMarker[]> {
    const to = new Date();
    const from = new Date(to.getTime() - rangeToMs(range));
    const transactions = await this.transactionRepository.findByUserIdBetween(userId, from, to);
    if (!transactions.length) return [];

    const byBucket: Map<number, { buy: number; sell: number; buyAmount: number; sellAmount: number }> = new Map();

    for (const tx of transactions) {
      const key = bucketKey(tx.executedAt instanceof Date ? tx.executedAt : new Date(tx.executedAt), timeframe);
      let entry = byBucket.get(key);
      if (!entry) {
        entry = { buy: 0, sell: 0, buyAmount: 0, sellAmount: 0 };
        byBucket.set(key, entry);
      }
      if (tx.type === 'BUY') {
        entry.buy += 1;
        entry.buyAmount += tx.total;
      } else {
        entry.sell += 1;
        entry.sellAmount += tx.total;
      }
    }

    const markers: PortfolioMarker[] = [];
    byBucket.forEach((entry, t) => {
      if (entry.buy > 0) {
        markers.push({
          t,
          side: 'BUY',
          count: entry.buy,
          amount: Math.round(entry.buyAmount * 100) / 100,
        });
      }
      if (entry.sell > 0) {
        markers.push({
          t,
          side: 'SELL',
          count: entry.sell,
          amount: Math.round(entry.sellAmount * 100) / 100,
        });
      }
    });
    markers.sort((a, b) => a.t - b.t);
    return markers;
  }
}
