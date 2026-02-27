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
  ): Promise<Transaction> {
    const doc = await TransactionModel.create({
      userId,
      symbol: symbol.trim().toUpperCase(),
      type,
      shares,
      price,
      total,
      executedAt: new Date(),
    });
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
}
