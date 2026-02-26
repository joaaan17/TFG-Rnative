import type { MarketOverviewPort } from '../../domain/market.ports';
import type { MarketOverview } from '../../domain/market.types';

const MIN_SYMBOL_LENGTH = 1;
const MAX_SYMBOL_LENGTH = 15;
/** Símbolo: letras, números, punto, guión, igual (tickers especiales). */
const SYMBOL_REGEX = /^[A-Z0-9.\-=]+$/;

export class GetMarketOverviewUseCase {
  constructor(private readonly overviewPort: MarketOverviewPort) {}

  async execute(input: { symbol: string }): Promise<MarketOverview> {
    const raw = typeof input.symbol === 'string' ? input.symbol.trim() : '';
    const symbol = raw.toUpperCase();

    if (!symbol) {
      throw new Error('symbol is required');
    }
    if (symbol.length < MIN_SYMBOL_LENGTH || symbol.length > MAX_SYMBOL_LENGTH) {
      throw new Error(
        `symbol must be between ${MIN_SYMBOL_LENGTH} and ${MAX_SYMBOL_LENGTH} characters`,
      );
    }
    if (!SYMBOL_REGEX.test(symbol)) {
      throw new Error('symbol contains invalid characters');
    }

    return this.overviewPort.getOverview(symbol);
  }
}
