import type { MarketSearchPort } from '../../domain/market.ports';
import type {
  MarketSearchResult,
  MarketSearchResultType,
} from '../../domain/market.types';

/**
 * Cliente yahoo-finance2 (v3): crear la clase con createYahooFinance + módulo search
 * e instanciarla. El default export del paquete principal puede estar en caché como
 * clase sin prototype correcto en algunos entornos (tsx/esm); esta vía es fiable.
 */
function getYahooFinanceClient(): {
  search: (query: string) => Promise<{ quotes: unknown[] }>;
} {
  const createYahooFinance =
    require('yahoo-finance2/createYahooFinance').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const searchModule = require('yahoo-finance2/modules/search').default;
  const YahooFinanceClass = createYahooFinance({
    modules: { search: searchModule },
  });
  return new YahooFinanceClass();
}

const NETWORK_TIMEOUT_MS = 12_000;

/** Mapeo quoteType de Yahoo -> nuestro tipo de dominio */
const QUOTE_TYPE_MAP: Record<string, MarketSearchResultType> = {
  EQUITY: 'EQUITY',
  ETF: 'ETF',
  CRYPTOCURRENCY: 'CRYPTO',
  INDEX: 'INDEX',
  MUTUALFUND: 'FUND',
  CURRENCY: 'FX',
};

function toDomainType(quoteType: unknown): MarketSearchResultType {
  if (typeof quoteType !== 'string') return 'UNKNOWN';
  const t = QUOTE_TYPE_MAP[quoteType];
  if (t) return t;
  const u = quoteType.toUpperCase();
  if (
    u === 'EQUITY' ||
    u === 'ETF' ||
    u === 'CRYPTO' ||
    u === 'INDEX' ||
    u === 'FUND' ||
    u === 'FX'
  )
    return u as MarketSearchResultType;
  return 'UNKNOWN';
}

/**
 * Resultado crudo de la búsqueda (solo campos que usamos).
 * La librería devuelve SearchResult con quotes[]; cada quote tiene symbol, longname, shortname, exchange, quoteType.
 */
interface YahooSearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
  currency?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`Market search timeout after ${ms}ms`));
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

/** Extrae quotes del resultado (normal o desde error de validación). */
function extractQuotes(
  raw: unknown,
): YahooSearchQuote[] {
  if (!raw || typeof raw !== 'object') return [];
  const quotes = (raw as { quotes?: unknown }).quotes;
  if (!Array.isArray(quotes)) return [];
  return quotes.filter(
    (q): q is YahooSearchQuote => q != null && typeof q === 'object',
  );
}

export class YahooFinanceMarketSearchAdapter implements MarketSearchPort {
  async search(query: string, limit: number): Promise<MarketSearchResult[]> {
    const client = getYahooFinanceClient();
    let quotes: YahooSearchQuote[] = [];

    try {
      const raw = await withTimeout(client.search(query), NETWORK_TIMEOUT_MS);
      quotes = extractQuotes(raw);
    } catch (err) {
      // yahoo-finance2 lanza FailedYahooValidationError cuando Yahoo devuelve datos
      // que no cumplen el schema estricto, pero el result suele contener quotes útiles
      const errResult = err && typeof err === 'object' && (err as { result?: unknown }).result;
      if (errResult) {
        quotes = extractQuotes(errResult);
      }
      if (quotes.length === 0) throw err;
    }

    const results: MarketSearchResult[] = [];

    for (const q of quotes) {
      const symbol =
        typeof q.symbol === 'string' && q.symbol.trim()
          ? q.symbol.trim().toUpperCase()
          : null;
      const name =
        typeof q.longname === 'string' && q.longname.trim()
          ? q.longname.trim()
          : typeof q.shortname === 'string' && q.shortname.trim()
            ? q.shortname.trim()
            : null;

      if (!symbol || !name) continue;

      results.push({
        symbol,
        name,
        exchange:
          typeof q.exchange === 'string' && q.exchange.trim()
            ? q.exchange.trim()
            : undefined,
        type: toDomainType(q.quoteType),
        currency:
          typeof q.currency === 'string' && q.currency.trim()
            ? q.currency.trim()
            : undefined,
      });

      if (results.length >= limit) break;
    }

    return results;
  }
}
