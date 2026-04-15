import type {
  GetHistoricalDailyPort,
  GetHistoricalHourlyPort,
  TransactionRepository,
} from '../../domain/ports';
import type {
  PerformanceRange,
  PerformancePoint,
  Transaction,
} from '../../domain/investments.types';

const LOG_PREFIX = '[Analytics]';

const RANGE_TO_DAYS: Record<PerformanceRange, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 31,
  '3M': 92,
  '6M': 183,
  '1Y': 365,
};

const RANGE_TO_CACHE: Record<PerformanceRange, string> = {
  '1D': '1wk',
  '1W': '1wk',
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1Y': '1y',
};

const HALF_HOUR_MS = 30 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function dayStart(d: Date): number {
  const t = new Date(d);
  t.setUTCHours(0, 0, 0, 0);
  return t.getTime();
}

function hourStart(ms: number): number {
  return Math.floor(ms / ONE_HOUR_MS) * ONE_HOUR_MS;
}

function dayKeyToISO(ms: number): string {
  return new Date(ms).toISOString();
}

export class PortfolioAnalyticsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly getHistoricalDaily: GetHistoricalDailyPort,
    private readonly getHistoricalHourly: GetHistoricalHourlyPort | null,
    private readonly initialCash: number,
  ) {}

  async getPerformance(
    userId: string,
    range: PerformanceRange,
    requestId?: string,
  ): Promise<{
    points: PerformancePoint[];
    symbolsUsed: string[];
    cacheStatuses: string[];
  }> {
    const end = new Date();
    const endMs = end.getTime();

    const startTime = Date.now();
    const allTxs = await this.transactionRepository.findByUserIdExecutedBefore(
      userId,
      end,
    );
    const symbols = [
      ...new Set(allTxs.map((t) => t.symbol.trim().toUpperCase())),
    ].filter(Boolean);
    console.log(
      `${LOG_PREFIX} performance user=${userId} range=${range} symbols=${symbols.length}`,
    );

    if (range === '1D' && this.getHistoricalHourly) {
      return this.getPerformance1D(
        allTxs,
        symbols,
        endMs,
        requestId,
        startTime,
      );
    }

    const days = RANGE_TO_DAYS[range];
    const start = new Date(endMs - days * 24 * 60 * 60 * 1000);
    const startMs = dayStart(start);
    const endDayMs = dayStart(end);
    const priceBySymbolByDay = new Map<string, Map<number, number>>();
    const cacheStatuses: string[] = [];
    const cacheRange = RANGE_TO_CACHE[range];

    for (const symbol of symbols) {
      try {
        const { candles, cacheStatus } =
          await this.getHistoricalDaily.getHistoricalDaily(
            symbol,
            cacheRange,
            requestId,
          );
        cacheStatuses.push(cacheStatus);
        console.log(
          `${LOG_PREFIX} priceHistory cache ${cacheStatus} por símbolo ${symbol}`,
        );
        const byDay = new Map<number, number>();
        for (const c of candles) {
          const tMs =
            typeof c.t === 'number' && c.t < 1e12 ? c.t * 1000 : (c.t as number);
          const d = dayStart(new Date(tMs));
          byDay.set(d, c.c);
        }
        priceBySymbolByDay.set(symbol, byDay);
      } catch (err) {
        console.warn(
          `${LOG_PREFIX} getHistoricalDaily failed for ${symbol}, skipping:`,
          err instanceof Error ? err.message : err,
        );
        cacheStatuses.push('ERROR');
      }
    }

    const txsBeforeStart = allTxs.filter(
      (t) => new Date(t.executedAt).getTime() < startMs,
    );
    let cash = this.initialCash;
    const holdings = new Map<string, { shares: number; avgBuyPrice: number }>();
    for (const tx of txsBeforeStart) {
      cash = this.applyTransaction(tx, holdings, cash);
    }

    const points: PerformancePoint[] = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    for (let tMs = startMs; tMs <= endDayMs; tMs += oneDayMs) {
      const dayTxs = allTxs.filter((tx) => {
        const txMs = new Date(tx.executedAt).getTime();
        return txMs >= tMs && txMs < tMs + oneDayMs;
      });
      for (const tx of dayTxs) {
        cash = this.applyTransaction(tx, holdings, cash);
      }
      let positionsValue = 0;
      for (const [sym, h] of holdings) {
        if (h.shares <= 0) continue;
        const byDay = priceBySymbolByDay.get(sym);
        const price = byDay?.get(tMs) ?? byDay?.get(tMs - oneDayMs);
        if (price != null && Number.isFinite(price)) {
          positionsValue += h.shares * price;
        }
      }
      const equity = cash + positionsValue;
      const invested = this.initialCash - cash;
      points.push({
        t: dayKeyToISO(tMs),
        equity: Math.round(equity * 100) / 100,
        cash: Math.round(cash * 100) / 100,
        positions: Math.round(positionsValue * 100) / 100,
        invested: Math.round(invested * 100) / 100,
      });
    }

    const took = Date.now() - startTime;
    console.log(
      `${LOG_PREFIX} computed points=${points.length} took=${took}ms`,
    );
    return { points, symbolsUsed: symbols, cacheStatuses };
  }

  private async getPerformance1D(
    allTxs: Transaction[],
    symbols: string[],
    endMs: number,
    requestId: string | undefined,
    startTime: number,
  ): Promise<{
    points: PerformancePoint[];
    symbolsUsed: string[];
    cacheStatuses: string[];
  }> {
    const cacheStatuses: string[] = [];
    const priceBySymbolByHour = new Map<string, Map<number, number>>();

    for (const symbol of symbols) {
      try {
        const { candles, cacheStatus } =
          await this.getHistoricalHourly!.getHistoricalHourly(
            symbol,
            '5d',
            requestId,
          );
        cacheStatuses.push(cacheStatus);
        const byHour = new Map<number, number>();
        for (const c of candles) {
          const tMs =
            typeof c.t === 'number' && c.t < 1e12 ? c.t * 1000 : (c.t as number);
          const h = hourStart(tMs);
          byHour.set(h, c.c);
        }
        priceBySymbolByHour.set(symbol, byHour);
      } catch (err) {
        console.warn(
          `${LOG_PREFIX} getHistoricalHourly failed for ${symbol}, skipping:`,
          err instanceof Error ? err.message : err,
        );
        cacheStatuses.push('ERROR');
      }
    }

    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const firstSlotMs = hourStart(endMs - twentyFourHoursMs);
    const points: PerformancePoint[] = [];
    let cash = this.initialCash;
    const holdings = new Map<string, { shares: number; avgBuyPrice: number }>();

    const txsBeforeFirst = allTxs.filter(
      (tx) => new Date(tx.executedAt).getTime() < firstSlotMs,
    );
    for (const tx of txsBeforeFirst) {
      cash = this.applyTransaction(tx, holdings, cash);
    }

    for (let slotMs = firstSlotMs; slotMs <= endMs; slotMs += HALF_HOUR_MS) {
      const slotEndMs = slotMs + HALF_HOUR_MS;
      const slotTxs = allTxs.filter((tx) => {
        const txMs = new Date(tx.executedAt).getTime();
        return txMs >= slotMs && txMs < slotEndMs;
      });
      for (const tx of slotTxs) {
        cash = this.applyTransaction(tx, holdings, cash);
      }
      const priceLookupMs = hourStart(slotMs);
      let positionsValue = 0;
      for (const [sym, h] of holdings) {
        if (h.shares <= 0) continue;
        const byHour = priceBySymbolByHour.get(sym);
        const price =
          byHour?.get(priceLookupMs) ??
          byHour?.get(priceLookupMs - ONE_HOUR_MS);
        if (price != null && Number.isFinite(price)) {
          positionsValue += h.shares * price;
        }
      }
      const equity = cash + positionsValue;
      const invested = this.initialCash - cash;
      points.push({
        t: dayKeyToISO(slotMs),
        equity: Math.round(equity * 100) / 100,
        cash: Math.round(cash * 100) / 100,
        positions: Math.round(positionsValue * 100) / 100,
        invested: Math.round(invested * 100) / 100,
      });
    }

    const took = Date.now() - startTime;
    console.log(
      `${LOG_PREFIX} 1D computed points=${points.length} took=${took}ms`,
    );
    return { points, symbolsUsed: symbols, cacheStatuses };
  }

  private applyTransaction(
    tx: Transaction,
    holdings: Map<string, { shares: number; avgBuyPrice: number }>,
    cash: number,
  ): number {
    const sym = tx.symbol.trim().toUpperCase();
    const h = holdings.get(sym) ?? { shares: 0, avgBuyPrice: 0 };
    if (tx.type === 'BUY') {
      const totalCost = h.shares * h.avgBuyPrice + tx.total;
      const newShares = h.shares + tx.shares;
      holdings.set(sym, {
        shares: newShares,
        avgBuyPrice: newShares > 0 ? totalCost / newShares : 0,
      });
      return cash - tx.total;
    }
    const sold = tx.shares;
    holdings.set(sym, {
      shares: h.shares - sold,
      avgBuyPrice: h.avgBuyPrice,
    });
    return cash + tx.total;
  }
}
