import type { GetQuotesPort } from '../../domain/ports';

export type GetQuotesFn = (symbols: string[]) => Promise<Array<{ symbol: string; price?: number | null }>>;

/**
 * Adaptador que obtiene precios de varios símbolos (para allocation).
 * Usa el mismo servicio de market que GetQuotePort.
 */
export class MarketQuotesAdapter implements GetQuotesPort {
  constructor(private readonly fetchQuotes: GetQuotesFn) {}

  async getQuotes(symbols: string[]): Promise<Array<{ symbol: string; price: number | null }>> {
    const normalized = symbols
      .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''))
      .filter((s) => s.length > 0);
    const unique = [...new Set(normalized)];
    if (unique.length === 0) return [];
    const items = await this.fetchQuotes(unique);
    return items.map((q) => ({
      symbol: (q.symbol ?? '').toUpperCase(),
      price: q.price != null && Number.isFinite(q.price) ? q.price : null,
    }));
  }
}
