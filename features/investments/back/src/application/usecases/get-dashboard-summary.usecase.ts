import type {
  PortfolioRepository,
  TransactionRepository,
  GetQuotesPort,
} from '../../domain/ports';
import type {
  DashboardSummaryResponse,
  DashboardSummaryDTO,
  DashboardContextDTO,
  DashboardSummaryProfitability,
  DashboardContextBestWorstDTO,
  DashboardContextDominantAssetDTO,
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
    private readonly getQuotes?: GetQuotesPort,
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

    const fallbackOverview: PortfolioOverview = {
      totalValue: 0,
      allocation: [],
      markers: [],
    };

    const [portfolio, overview, transactions, performance1D] =
      await Promise.all([
        this.portfolioRepository.findByUserId(uid),
        this.getPortfolioOverview(uid, '1d', '6mo').catch((err) => {
          console.warn(
            `${LOG} getPortfolioOverview failed, using fallback:`,
            err instanceof Error ? err.message : err,
          );
          return fallbackOverview;
        }),
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
    const totalValue =
      overview.totalValue > 0 ? overview.totalValue : totalInvested + portfolio.cashBalance;
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

    const context = await this.buildContext(
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

    if (
      allocationGeography.length === 0 &&
      portfolio.holdings.length > 0 &&
      totalInvested > 0
    ) {
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
        dominantAsset: null,
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

  private async buildContext(
    holdings: Holding[],
    allocation: AllocationItem[],
    transactions: {
      type: 'BUY' | 'SELL';
      symbol: string;
      shares: number;
      executedAt: Date;
      price?: number;
      total?: number;
      avgBuyPrice?: number;
    }[],
  ): Promise<DashboardContextDTO> {
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

    const dominantAsset: DashboardContextDominantAssetDTO | null = (() => {
      const stocks = allocation.filter(
        (a) =>
          a.symbol?.trim() &&
          a.symbol.toUpperCase() !== 'CASH' &&
          a.symbol.toUpperCase() !== 'OTHERS',
      );
      if (stocks.length > 0) {
        const max = stocks.reduce((prev, curr) =>
          curr.weight > prev.weight ? curr : prev,
        );
        return {
          symbol: max.symbol.trim().toUpperCase(),
          weightPercent: Math.round(max.weight * 10000) / 100,
        };
      }
      // Fallback: si allocation no tiene stocks (p. ej. getQuotes falló),
      // calcular el dominante por coste (holdings) para que la card no desaparezca
      const totalInvested = holdingsWithShares.reduce(
        (s, h) => s + h.shares * h.avgBuyPrice,
        0,
      );
      if (totalInvested <= 0 || holdingsWithShares.length === 0) return null;
      let maxSym = '';
      let maxWeight = 0;
      for (const h of holdingsWithShares) {
        const cost = h.shares * h.avgBuyPrice;
        const w = cost / totalInvested;
        if (w > maxWeight) {
          maxWeight = w;
          maxSym = h.symbol.trim().toUpperCase();
        }
      }
      if (!maxSym) return null;
      return {
        symbol: maxSym,
        weightPercent: Math.round(maxWeight * 10000) / 100,
      };
    })();

    const lastTx = transactions[0];
    let lastOperation: DashboardContextLastOperationDTO | null = null;

    if (lastTx) {
      let price = Number(lastTx.price) || 0;
      let total = Number(lastTx.total) || 0;
      const shares = Number(lastTx.shares) || 0;
      const avgBuyPrice =
        lastTx.type === 'SELL' && lastTx.avgBuyPrice != null
          ? Number(lastTx.avgBuyPrice)
          : undefined;

      // Fallback 1: inferir desde el otro campo cuando uno es 0
      if (total <= 0 && price > 0 && shares > 0) {
        total = Math.round(price * shares * 100) / 100;
      }
      if (price <= 0 && total > 0 && shares > 0) {
        price = Math.round((total / shares) * 10000) / 100;
      }
      // Fallback 2: SELL con avgBuyPrice — usar como estimación
      if (
        (price <= 0 || total <= 0) &&
        lastTx.type === 'SELL' &&
        avgBuyPrice != null &&
        avgBuyPrice > 0 &&
        shares > 0
      ) {
        if (price <= 0) price = avgBuyPrice;
        if (total <= 0) total = Math.round(avgBuyPrice * shares * 100) / 100;
      }
      // Fallback 3: ambos 0 — obtener cotización actual
      if ((price <= 0 || total <= 0) && this.getQuotes && shares > 0) {
        try {
          const quotes = await this.getQuotes.getQuotes([
            lastTx.symbol.trim().toUpperCase(),
          ]);
          const q = quotes[0];
          if (q?.price != null && Number.isFinite(q.price) && q.price > 0) {
            if (price <= 0) price = Math.round(q.price * 10000) / 100;
            if (total <= 0) total = Math.round(price * shares * 100) / 100;
          }
        } catch {
          // ignorar; mantener 0 si falla
        }
      }

      const costBasis =
        lastTx.type === 'SELL' && avgBuyPrice != null && shares > 0
          ? avgBuyPrice * shares
          : undefined;
      const profitLoss = costBasis != null ? total - costBasis : undefined;

      lastOperation = {
        type: lastTx.type,
        symbol: lastTx.symbol,
        shares,
        executedAt:
          lastTx.executedAt instanceof Date
            ? lastTx.executedAt.toISOString()
            : String(lastTx.executedAt),
        price,
        total,
        avgBuyPrice,
        profitLoss,
      };
    }

    return {
      bestAsset,
      worstAsset,
      dominantAsset,
      assetsCount,
      operationsCount,
      lastOperation,
    };
  }
}
