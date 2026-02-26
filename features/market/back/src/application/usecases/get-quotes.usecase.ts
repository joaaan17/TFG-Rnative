import type { MarketQuotesPort } from '../../domain/market.ports';
import type { QuoteItem } from '../../domain/market.types';

const MAX_SYMBOLS = 20;

export class GetQuotesUseCase {
  constructor(private readonly quotesPort: MarketQuotesPort) {}

  async execute(symbols: string[]): Promise<QuoteItem[]> {
    const normalized = symbols
      .slice(0, MAX_SYMBOLS)
      .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''))
      .filter((s) => s.length > 0);
    const unique = [...new Set(normalized)];
    if (unique.length === 0) return [];
    return this.quotesPort.getQuotes(unique);
  }
}
