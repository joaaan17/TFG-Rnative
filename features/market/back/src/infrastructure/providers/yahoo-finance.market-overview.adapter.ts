import type { MarketOverviewPort } from '../../domain/market.ports';
import type {
  FundamentalsSnapshot,
  MarketOverview,
  QuoteSnapshot,
} from '../../domain/market.types';

const OVERVIEW_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`Overview request timeout after ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

function toStr(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

/** Cache en memoria por symbol, TTL 30s */
const overviewCache = new Map<
  string,
  { data: MarketOverview; expiresAt: number }
>();

function getCached(symbol: string): MarketOverview | null {
  const entry = overviewCache.get(symbol);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) overviewCache.delete(symbol);
    return null;
  }
  return entry.data;
}

function setCached(symbol: string, data: MarketOverview): void {
  overviewCache.set(symbol, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export class YahooFinanceMarketOverviewAdapter implements MarketOverviewPort {
  async getOverview(symbol: string): Promise<MarketOverview> {
    const cached = getCached(symbol);
    if (cached) return cached;

    const createYahooFinance =
      require('yahoo-finance2/createYahooFinance').default;
    const quoteModule = require('yahoo-finance2/modules/quote').default;
    const quoteSummaryModule =
      require('yahoo-finance2/modules/quoteSummary').default;
    const YahooFinanceClass = createYahooFinance({
      modules: { quote: quoteModule, quoteSummary: quoteSummaryModule },
    });
    const client = new YahooFinanceClass();

    const asOf = Date.now();

    const run = async (): Promise<MarketOverview> => {
      const [quoteList, summaryResult] = await Promise.all([
        client.quote([symbol]).catch(() => null),
        client
          .quoteSummary(symbol, {
            modules: [
              'summaryDetail',
              'defaultKeyStatistics',
              'financialData',
              'assetProfile',
            ],
          })
          .catch(() => null),
      ]);
      const quoteResult =
        Array.isArray(quoteList) && quoteList.length > 0 ? quoteList[0] : null;

      const quote: QuoteSnapshot = {
        open: toNum(
          (quoteResult as { regularMarketOpen?: number } | null)
            ?.regularMarketOpen,
        ),
        high: toNum(
          (quoteResult as { regularMarketDayHigh?: number } | null)
            ?.regularMarketDayHigh,
        ),
        low: toNum(
          (quoteResult as { regularMarketDayLow?: number } | null)
            ?.regularMarketDayLow,
        ),
        volume: toNum(
          (quoteResult as { regularMarketVolume?: number } | null)
            ?.regularMarketVolume,
        ),
        marketCap: toNum(
          (quoteResult as { marketCap?: number } | null)?.marketCap,
        ),
        currency: toStr(
          (quoteResult as { currency?: string } | null)?.currency,
        ),
      };

      const summary = summaryResult as {
        summaryDetail?: {
          trailingPE?: number;
          forwardPE?: number;
          marketCap?: number;
          beta?: number;
        };
        defaultKeyStatistics?: { trailingEps?: number };
        financialData?: { quickRatio?: number };
        assetProfile?: { sector?: string; industry?: string };
      } | null;

      const summaryDetail = summary?.summaryDetail;
      const defaultKeyStatistics = summary?.defaultKeyStatistics;
      const financialData = summary?.financialData;
      const assetProfile = summary?.assetProfile;

      const pe =
        toNum(summaryDetail?.trailingPE) ?? toNum(summaryDetail?.forwardPE);
      const marketCapFund =
        toNum(summaryDetail?.marketCap) ?? quote.marketCap ?? null;

      const fundamentals: FundamentalsSnapshot = {
        pe,
        eps: toNum(defaultKeyStatistics?.trailingEps),
        quickRatio: toNum(financialData?.quickRatio),
        beta: toNum(summaryDetail?.beta),
        marketCap: marketCapFund,
        sector: toStr(assetProfile?.sector),
        industry: toStr(assetProfile?.industry),
      };

      if (quote.marketCap == null && fundamentals.marketCap != null) {
        quote.marketCap = fundamentals.marketCap;
      }

      const overview: MarketOverview = {
        symbol: symbol.toUpperCase(),
        asOf,
        quote,
        fundamentals,
      };

      setCached(symbol, overview);
      return overview;
    };

    try {
      return await withTimeout(run(), OVERVIEW_TIMEOUT_MS);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Overview provider error';
      throw new Error(msg);
    }
  }
}
