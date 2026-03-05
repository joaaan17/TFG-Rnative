import type { GetQuotePort } from '../../domain/ports';

export type GetQuotesFn = (
  symbols: string[],
) => Promise<{ symbol: string; price?: number }[]>;

/**
 * Adaptador que usa el servicio de cotizaciones existente (market) para obtener
 * el precio actual de un símbolo. Centraliza el precio en el backend.
 */
export class MarketQuoteAdapter implements GetQuotePort {
  constructor(private readonly getQuotes: GetQuotesFn) {}

  async getQuote(
    symbol: string,
  ): Promise<{ price: number; timestamp?: Date } | null> {
    const normalized = symbol?.trim().toUpperCase();
    if (!normalized) return null;
    const quotes = await this.getQuotes([normalized]);
    const item = quotes.find(
      (q) => (q.symbol ?? '').toUpperCase() === normalized,
    );
    if (item?.price != null && Number.isFinite(item.price)) {
      return { price: item.price, timestamp: new Date() };
    }
    return null;
  }
}
