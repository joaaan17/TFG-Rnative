import type { PortfolioRepository } from '../../domain/ports';
import { PORTFOLIO_CURRENCY } from '../../domain/investments.types';

export class GetOrCreatePortfolioUseCase {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly initialCashBalance: number,
  ) {}

  async execute(userId: string): Promise<{
    cashBalance: number;
    currency: string;
    holdings: {
      symbol: string;
      shares: number;
      avgBuyPrice: number;
      lastUpdatedAt: string;
    }[];
  }> {
    const raw = typeof userId === 'string' ? userId.trim() : '';
    if (!raw) {
      throw new Error('userId is required');
    }

    let portfolio = await this.portfolioRepository.findByUserId(raw);
    if (!portfolio) {
      portfolio = await this.portfolioRepository.create(
        raw,
        this.initialCashBalance,
        PORTFOLIO_CURRENCY,
      );
    }

    return {
      cashBalance: portfolio.cashBalance,
      currency: portfolio.currency,
      holdings: portfolio.holdings.map((h) => ({
        symbol: h.symbol,
        shares: h.shares,
        avgBuyPrice: h.avgBuyPrice,
        lastUpdatedAt: h.lastUpdatedAt.toISOString(),
      })),
    };
  }
}
