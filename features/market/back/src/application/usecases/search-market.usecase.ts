import type { MarketSearchPort } from '../../domain/market.ports';
import type { MarketSearchResult } from '../../domain/market.types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export class SearchMarketUseCase {
  constructor(private readonly marketSearch: MarketSearchPort) {}

  async execute(
    query: string,
    limitRaw?: number,
  ): Promise<{ query: string; count: number; results: MarketSearchResult[] }> {
    const q = typeof query === 'string' ? query.trim() : '';
    let limit =
      limitRaw !== undefined && limitRaw !== null
        ? Number(limitRaw)
        : DEFAULT_LIMIT;
    if (Number.isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const results = await this.marketSearch.search(q, limit);

    return {
      query: q,
      count: results.length,
      results,
    };
  }
}
