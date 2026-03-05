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
  SectorAllocationItem,
  GeographyAllocationItem,
  Holding,
  PerformancePoint,
  PortfolioOverview,
} from '../../domain/investments.types';

const LOG = '[GetDashboardSummaryUseCase]';

/** Perfil de activo desde Yahoo (sector y país para donuts Sector/Geográfica). */
export type AssetProfile = { sector: string | null; country: string | null };

/** Obtiene sector y país de un símbolo (una sola llamada a overview por símbolo). */
export type GetProfileBySymbolFn = (symbol: string) => Promise<AssetProfile>;

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
    private readonly getProfileBySymbol: GetProfileBySymbolFn,
  ) {}

  async execute(userId: string): Promise<DashboardSummaryResponse> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) {
      return this.emptyResponse();
    }

    if (typeof this.getPortfolioOverview !== 'function') {
      throw new Error(
        `${LOG} getPortfolioOverview debe ser una función. Reinicia el servidor.`,
      );
    }

    const [portfolio, overview, transactions, performance1D] =
      await Promise.all([
        this.portfolioRepository.findByUserId(uid),
        this.getPortfolioOverview(uid, '1d', '6mo'),
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
    const profileMap = await this.fetchProfileMap(portfolio.holdings);
    const allocationSectors = this.buildAllocationSectors(
      portfolio.holdings,
      totalInvested,
      profileMap,
    );
    const allocationGeography = this.buildAllocationGeography(
      portfolio.holdings,
      totalInvested,
      profileMap,
    );

    if (allocationGeography.length === 0 && portfolio.holdings.length > 0 && totalInvested > 0) {
      console.warn(
        `${LOG} allocationGeography vacío con holdings existentes (${portfolio.holdings.length}, totalInvested=${totalInvested})`,
      );
    }

    return {
      summary,
      context,
      allocationStocks,
      allocationSectors,
      allocationGeography,
    };
  }

  /** Mapa país Yahoo -> región para donut Geográfica. */
  private countryToRegion(country: string | null): string {
    if (!country || !country.trim()) return 'Otros';
    const c = country.trim().toLowerCase();
    const EEUU = [
      'united states',
      'usa',
      'u.s.',
      'u.s.a.',
      'united states of america',
      'canada',
    ];
    const EUROPA = [
      'united kingdom',
      'uk',
      'germany',
      'france',
      'switzerland',
      'netherlands',
      'ireland',
      'spain',
      'italy',
      'sweden',
      'finland',
      'norway',
      'denmark',
      'belgium',
      'austria',
      'luxembourg',
    ];
    const ASIA = [
      'china',
      'japan',
      'south korea',
      'taiwan',
      'hong kong',
      'singapore',
      'india',
      'israel',
    ];
    const EMERGENTES = [
      'brazil',
      'mexico',
      'chile',
      'argentina',
      'colombia',
      'peru',
      'indonesia',
      'malaysia',
      'thailand',
      'philippines',
      'south africa',
      'russia',
    ];
    if (EEUU.some((x) => c.includes(x))) return 'EEUU';
    if (EUROPA.some((x) => c.includes(x))) return 'Europa';
    if (ASIA.some((x) => c.includes(x))) return 'Asia';
    if (EMERGENTES.some((x) => c.includes(x))) return 'Emergentes';
    return 'Otros';
  }

  private async fetchProfileMap(
    holdings: Holding[],
  ): Promise<Map<string, AssetProfile>> {
    const safeHoldings = (holdings ?? [])
      .map((h) => ({
        ...h,
        shares: Number(h.shares) || 0,
      }))
      .filter((h) => h.shares > 0);
    if (safeHoldings.length === 0) return new Map();

    const symbols = [
      ...new Set(safeHoldings.map((h) => h.symbol.trim().toUpperCase())),
    ];
    const map = new Map<string, AssetProfile>();
    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const profile = await this.getProfileBySymbol(sym);
          map.set(sym, profile);
        } catch {
          map.set(sym, { sector: null, country: null });
        }
      }),
    );
    return map;
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

    if (withShares.length === 0 || totalInvested <= 0) return [];

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

  private buildAllocationSectors(
    holdings: Holding[],
    totalInvested: number,
    profileMap: Map<string, AssetProfile>,
  ): SectorAllocationItem[] {
    const safeHoldings = (holdings ?? [])
      .map((h) => ({
        ...h,
        shares: Number(h.shares) || 0,
        avgBuyPrice: Number(h.avgBuyPrice) || 0,
      }))
      .filter((h) => h.shares > 0);

    if (safeHoldings.length === 0 || totalInvested <= 0) return [];

    const valueBySector = new Map<string, number>();
    for (const h of safeHoldings) {
      const profile = profileMap.get(h.symbol.trim().toUpperCase()) ?? {
        sector: null,
        country: null,
      };
      const sector = profile.sector?.trim() || 'Otros';
      const value = Math.round(h.shares * h.avgBuyPrice * 100) / 100;
      valueBySector.set(sector, (valueBySector.get(sector) ?? 0) + value);
    }

    return [...valueBySector.entries()].map(([sector, value]) => ({
      sector,
      value,
      weight: Math.round((value / totalInvested) * 10000) / 10000,
    }));
  }

  private buildAllocationGeography(
    holdings: Holding[],
    totalInvested: number,
    profileMap: Map<string, AssetProfile>,
  ): GeographyAllocationItem[] {
    const safeHoldings = (holdings ?? [])
      .map((h) => ({
        ...h,
        shares: Number(h.shares) || 0,
        avgBuyPrice: Number(h.avgBuyPrice) || 0,
      }))
      .filter((h) => h.shares > 0);

    if (safeHoldings.length === 0 || totalInvested <= 0) return [];

    const valueByRegion = new Map<string, number>();
    for (const h of safeHoldings) {
      const profile = profileMap.get(h.symbol.trim().toUpperCase()) ?? {
        sector: null,
        country: null,
      };
      const region = this.countryToRegion(profile.country);
      const value = Math.round(h.shares * h.avgBuyPrice * 100) / 100;
      valueByRegion.set(region, (valueByRegion.get(region) ?? 0) + value);
    }

    return [...valueByRegion.entries()].map(([region, value]) => ({
      region,
      value,
      weight: Math.round((value / totalInvested) * 10000) / 10000,
    }));
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
      allocationSectors: [],
      allocationGeography: [],
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
