import type { MarketQuotesPort } from '../../domain/market.ports';
import type { QuoteItem } from '../../domain/market.types';

const QUOTES_TIMEOUT_MS = 10_000;

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

export class YahooFinanceMarketQuotesAdapter implements MarketQuotesPort {
  async getQuotes(symbols: string[]): Promise<QuoteItem[]> {
    if (symbols.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createYahooFinance =
      require('yahoo-finance2/createYahooFinance').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const quoteModule = require('yahoo-finance2/modules/quote').default;
    const YahooFinanceClass = createYahooFinance({
      modules: { quote: quoteModule },
    });
    const client = new YahooFinanceClass();

    const raw = await withTimeout(
      client.quote(symbols),
      QUOTES_TIMEOUT_MS,
    );

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
            : symbol ?? '';
      const price =
        typeof q.regularMarketPrice === 'number' && Number.isFinite(q.regularMarketPrice)
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
