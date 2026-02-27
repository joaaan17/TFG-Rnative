import type { Transaction } from '../../domain/investments.types';
import type { TransactionRepository as ITransactionRepository } from '../../domain/ports';
import { TransactionModel } from './transaction.model';

function mapDocToTransaction(doc: {
  _id: unknown;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  executedAt: Date;
  avgBuyPrice?: number;
}): Transaction {
  return {
    _id: String(doc._id),
    userId: doc.userId,
    symbol: doc.symbol,
    type: doc.type,
    shares: doc.shares,
    price: doc.price,
    total: doc.total,
    executedAt: doc.executedAt instanceof Date ? doc.executedAt : new Date(doc.executedAt),
    avgBuyPrice: doc.avgBuyPrice,
  };
}

export class MongoTransactionRepository implements ITransactionRepository {
  async create(
    userId: string,
    symbol: string,
    type: 'BUY' | 'SELL',
    shares: number,
    price: number,
    total: number,
    avgBuyPrice?: number,
  ): Promise<Transaction> {
    const payload: Record<string, unknown> = {
      userId,
      symbol: symbol.trim().toUpperCase(),
      type,
      shares,
      price,
      total,
      executedAt: new Date(),
    };
    if (avgBuyPrice != null && Number.isFinite(avgBuyPrice)) {
      payload.avgBuyPrice = avgBuyPrice;
    }
    const doc = await TransactionModel.create(payload);
    return mapDocToTransaction(doc.toObject());
  }

  async findByUserId(userId: string, limit: number): Promise<Transaction[]> {
    const docs = await TransactionModel.find({ userId })
      .sort({ executedAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs.map(mapDocToTransaction);
  }

  async findByUserIdBetween(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<Transaction[]> {
    const docs = await TransactionModel.find({
      userId,
      executedAt: { $gte: from, $lte: to },
    })
      .sort({ executedAt: 1 })
      .lean()
      .exec();
    return docs.map(mapDocToTransaction);
  }

  async findByUserIdExecutedBefore(
    userId: string,
    beforeOrAt: Date,
  ): Promise<Transaction[]> {
    const docs = await TransactionModel.find({
      userId,
      executedAt: { $lte: beforeOrAt },
    })
      .sort({ executedAt: 1 })
      .lean()
      .exec();
    return docs.map(mapDocToTransaction);
  }
}
