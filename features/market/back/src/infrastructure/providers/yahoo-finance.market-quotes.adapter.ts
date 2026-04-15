import type { MarketQuotesPort } from '../../domain/market.ports';
import type { QuoteItem } from '../../domain/market.types';

const QUOTES_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error(`Quotes request timeout after ${ms}ms`));
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class YahooFinanceMarketQuotesAdapter implements MarketQuotesPort {
  async getQuotes(symbols: string[]): Promise<QuoteItem[]> {
    if (symbols.length === 0) return [];

    const normalized = [
      ...new Set(
        symbols.map((s) => String(s).trim().toUpperCase()).filter(Boolean),
      ),
    ];

    const createYahooFinance =
      require('yahoo-finance2/createYahooFinance').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const quoteModule = require('yahoo-finance2/modules/quote').default;
    const YahooFinanceClass = createYahooFinance({
      modules: { quote: quoteModule },
    });
    const client = new YahooFinanceClass();

    let raw: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        raw = await withTimeout(client.quote(normalized), QUOTES_TIMEOUT_MS);
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        console.warn(
          `[YahooQuotes] attempt ${attempt + 1} failed (${err instanceof Error ? err.message : err}), retrying in ${RETRY_DELAY_MS}ms…`,
        );
        await sleep(RETRY_DELAY_MS);
      }
    }

    const list = Array.isArray(raw) ? raw : [];
    const results: QuoteItem[] = [];

    for (const q of list) {
      const symbol =
        typeof q.symbol === 'string' && q.symbol.trim()
          ? q.symbol.trim().toUpperCase()
          : null;
      const name =
        typeof q.longName === 'string' && q.longName.trim()
          ? q.longName.trim()
          : typeof q.shortName === 'string' && q.shortName.trim()
            ? q.shortName.trim()
            : (symbol ?? '');
      const price =
        typeof q.regularMarketPrice === 'number' &&
        Number.isFinite(q.regularMarketPrice)
          ? q.regularMarketPrice
          : undefined;
      const currency =
        typeof q.currency === 'string' && q.currency.trim()
          ? q.currency.trim()
          : undefined;
      if (symbol) {
        results.push({
          symbol,
          name: name || symbol,
          price,
          currency,
        });
      }
    }

    return results;
  }
}
