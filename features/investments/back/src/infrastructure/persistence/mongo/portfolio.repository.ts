import type { Holding, Portfolio } from '../../domain/investments.types';
import type { PortfolioRepository as IPortfolioRepository } from '../../domain/ports';
import { PortfolioModel } from './portfolio.model';

const DEFAULT_INITIAL_CASH =
  Number(process.env.PORTFOLIO_INITIAL_CASH) || 10_000;

function mapDocToPortfolio(doc: {
  _id: unknown;
  userId: string;
  cashBalance: number;
  currency: string;
  holdings: Holding[];
}): Portfolio {
  return {
    _id: String(doc._id),
    userId: doc.userId,
    cashBalance: doc.cashBalance,
    currency: doc.currency,
    holdings: (doc.holdings ?? []).map((h) => ({
      symbol: h.symbol,
      shares: h.shares,
      avgBuyPrice: h.avgBuyPrice,
      lastUpdatedAt:
        h.lastUpdatedAt instanceof Date
          ? h.lastUpdatedAt
          : new Date(h.lastUpdatedAt),
    })),
  };
}

export class MongoPortfolioRepository implements IPortfolioRepository {
  constructor(
    private readonly initialCashBalance: number = DEFAULT_INITIAL_CASH,
  ) {}

  async findByUserId(userId: string): Promise<Portfolio | null> {
    const doc = await PortfolioModel.findOne({ userId }).lean().exec();
    if (!doc) return null;
    return mapDocToPortfolio(doc);
  }

  async create(
    userId: string,
    cashBalance: number,
    currency: string,
  ): Promise<Portfolio> {
    const doc = await PortfolioModel.create({
      userId,
      cashBalance,
      currency,
      holdings: [],
    });
    return mapDocToPortfolio(doc.toObject());
  }

  async updateCashAndHoldings(
    userId: string,
    newCashBalance: number,
    holdings: Holding[],
  ): Promise<Portfolio | null> {
    const doc = await PortfolioModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          cashBalance: newCashBalance,
          holdings: holdings.map((h) => ({
            ...h,
            lastUpdatedAt: h.lastUpdatedAt ?? new Date(),
          })),
        },
      },
      { new: true },
    )
      .lean()
      .exec();
    if (!doc) return null;
    return mapDocToPortfolio(doc);
  }
}
