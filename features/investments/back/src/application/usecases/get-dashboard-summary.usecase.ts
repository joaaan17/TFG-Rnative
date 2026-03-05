import type {
  PortfolioRepository,
  TransactionRepository,
} from '../../domain/ports';
import type {
  DashboardSummaryResponse,
  DashboardSummaryDTO,
  DashboardContextDTO,
  DashboardSummaryProfitability,
  DashboardContextBestWorstDTO,
  DashboardContextLastOperationDTO,
  AllocationItem,
  Holding,
  PerformancePoint,
  PortfolioOverview,
} from '../../domain/investments.types';

const LOG = '[GetDashboardSummaryUseCase]';

/** Función para obtener overview (totalValue + allocation). */
export type GetPortfolioOverviewFn = (
  userId: string,
  timeframe: string,
  range: string,
) => Promise<PortfolioOverview>;

/**
 * Caso de uso: resumen de cartera y contexto para el Dashboard (MVVM).
 * Calcula valor total, rentabilidad total/diaria, cash, total invertido,
 * mejor/peor activo, número de activos y operaciones, última operación.
 */
export class GetDashboardSummaryUseCase {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly getPortfolioOverview: GetPortfolioOverviewFn,
    private readonly transactionRepository: TransactionRepository,
    private readonly getPerformance1D: (
      userId: string,
    ) => Promise<{ points: PerformancePoint[] }>,
  ) {
    const isFn = typeof this.getPortfolioOverview === 'function';
    console.log(
      `${LOG} constructor: getPortfolioOverview typeof=${typeof this.getPortfolioOverview} isFunction=${isFn} hasExecute=${typeof (this.getPortfolioOverview as { execute?: unknown })?.execute === 'function'}`,
    );
  }

  async execute(userId: string): Promise<DashboardSummaryResponse> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    console.log(`${LOG} execute start userId=${uid}`);
    if (!uid) {
      return this.emptyResponse();
    }

    const overviewFn = this.getPortfolioOverview;
    const overviewType = typeof overviewFn;
    const isCallable = typeof overviewFn === 'function';
    console.log(
      `${LOG} getPortfolioOverview: typeof=${overviewType} isCallable=${isCallable}`,
    );
    if (!isCallable) {
      throw new Error(
        `${LOG} getPortfolioOverview is not callable (typeof=${overviewType}). Debe ser una función. Reinicia el servidor (Ctrl+C y npx tsx server/index).`,
      );
    }

    const [portfolio, overview, transactions, performance1D] =
      await Promise.all([
        this.portfolioRepository.findByUserId(uid),
        overviewFn(uid, '1d', '6mo'),
        this.transactionRepository.findByUserId(uid, 500),
        this.getPerformance1D(uid).catch(() => ({ points: [] })),
      ]);

    if (!portfolio) {
      return this.emptyResponse();
    }

    const totalInvested = portfolio.holdings.reduce(
      (sum, h) => sum + h.shares * h.avgBuyPrice,
      0,
    );
    const totalValue = overview.totalValue;
    const totalProfitability = this.computeProfitability(
      totalValue - totalInvested,
      totalInvested,
    );
    const dailyProfitability = this.computeDailyProfitability(
      performance1D.points,
    );

    const summary: DashboardSummaryDTO = {
      totalValue: Math.round(totalValue * 100) / 100,
      totalProfitability,
      dailyProfitability,
      availableCash: Math.round(portfolio.cashBalance * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      currency: portfolio.currency,
    };

    const context = this.buildContext(
      portfolio.holdings,
      overview.allocation,
      transactions,
    );

    const allocationStocks = this.buildAllocationStocks(
      portfolio.holdings,
      totalInvested,
    );

    // DEBUG: logs para diagnosticar por qué allocationStocks podría estar vacío
    console.log(
      `${LOG} holdings count=${portfolio.holdings?.length ?? 0}`,
      JSON.stringify(
        portfolio.holdings?.map((h) => ({
          symbol: h.symbol,
          shares: h.shares,
          avgBuyPrice: h.avgBuyPrice,
        })),
      ),
    );
    console.log(
      `${LOG} totalInvested=${totalInvested} allocationStocks.length=${allocationStocks.length}`,
      JSON.stringify(allocationStocks),
    );

    return { summary, context, allocationStocks };
  }

  private buildAllocationStocks(
    holdings: Holding[],
    totalInvested: number,
  ): AllocationItem[] {
    // Robustez: normalizar números por si MongoDB devuelve strings
    const safeHoldings = (holdings ?? []).map((h) => ({
      ...h,
      shares: Number(h.shares) || 0,
      avgBuyPrice: Number(h.avgBuyPrice) || 0,
    }));
    const withShares = safeHoldings.filter((h) => h.shares > 0);

    if (withShares.length === 0) {
      console.log(
        `${LOG} buildAllocationStocks: sin holdings con shares>0 (total=${holdings?.length ?? 0})`,
      );
      return [];
    }
    if (totalInvested <= 0) {
      console.log(
        `${LOG} buildAllocationStocks: totalInvested<=0 (${totalInvested}), retorno vacío`,
      );
      return [];
    }

    const items = withShares.map((h) => {
      const value = Math.round(h.shares * h.avgBuyPrice * 100) / 100;
      const weight = value / totalInvested;
      const sym = String(h.symbol ?? '')
        .trim()
        .toUpperCase();
      return {
        symbol: sym,
        name: sym,
        value,
        weight: Math.round(weight * 10000) / 10000,
      };
    });
    return items;
  }

  private emptyResponse(): DashboardSummaryResponse {
    return {
      summary: {
        totalValue: 0,
        totalProfitability: { amount: 0, percent: 0 },
        dailyProfitability: { amount: 0, percent: 0 },
        availableCash: 0,
        totalInvested: 0,
        currency: 'USD',
      },
      context: {
        bestAsset: null,
        worstAsset: null,
        assetsCount: 0,
        operationsCount: 0,
        lastOperation: null,
      },
      allocationStocks: [],
    };
  }

  private computeProfitability(
    amount: number,
    invested: number,
  ): DashboardSummaryProfitability {
    const safeInvested = invested > 0 ? invested : 1;
    const percent = Math.round((amount / safeInvested) * 10000) / 100;
    return {
      amount: Math.round(amount * 100) / 100,
      percent,
    };
  }

  private computeDailyProfitability(
    points: PerformancePoint[],
  ): DashboardSummaryProfitability {
    if (points.length < 2) {
      return { amount: 0, percent: 0 };
    }
    const prev = points[points.length - 2].equity;
    const curr = points[points.length - 1].equity;
    const amount = Math.round((curr - prev) * 100) / 100;
    const percent = prev > 0 ? Math.round((amount / prev) * 10000) / 100 : 0;
    return { amount, percent };
  }

  private buildContext(
    holdings: Holding[],
    allocation: AllocationItem[],
    transactions: {
      type: 'BUY' | 'SELL';
      symbol: string;
      shares: number;
      executedAt: Date;
    }[],
  ): DashboardContextDTO {
    const holdingsWithShares = holdings.filter((h) => h.shares > 0);
    const assetsCount = holdingsWithShares.length;
    const operationsCount = transactions.length;

    const costBySymbol = new Map<string, number>();
    for (const h of holdingsWithShares) {
      const sym = h.symbol.trim().toUpperCase();
      costBySymbol.set(sym, h.shares * h.avgBuyPrice);
    }

    const returns: { symbol: string; percent: number }[] = [];
    for (const a of allocation) {
      const sym = a.symbol.trim().toUpperCase();
      if (sym === 'CASH' || sym === 'OTHERS') continue;
      const cost = costBySymbol.get(sym) ?? 0;
      if (cost <= 0) continue;
      const value = a.value;
      const percent = Math.round(((value - cost) / cost) * 10000) / 100;
      returns.push({ symbol: sym, percent });
    }
    returns.sort((a, b) => b.percent - a.percent);

    const bestAsset: DashboardContextBestWorstDTO | null =
      returns.length > 0
        ? { symbol: returns[0].symbol, percent: returns[0].percent }
        : null;
    const worstAsset: DashboardContextBestWorstDTO | null =
      returns.length > 1
        ? {
            symbol: returns[returns.length - 1].symbol,
            percent: returns[returns.length - 1].percent,
          }
        : returns.length === 1
          ? { symbol: returns[0].symbol, percent: returns[0].percent }
          : null;

    const lastTx = transactions[0];
    const lastOperation: DashboardContextLastOperationDTO | null = lastTx
      ? {
          type: lastTx.type,
          symbol: lastTx.symbol,
          shares: lastTx.shares,
          executedAt:
            lastTx.executedAt instanceof Date
              ? lastTx.executedAt.toISOString()
              : String(lastTx.executedAt),
        }
      : null;

    return {
      bestAsset,
      worstAsset,
      assetsCount,
      operationsCount,
      lastOperation,
    };
  }
}
