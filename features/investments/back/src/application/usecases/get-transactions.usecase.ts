import type { TransactionRepository } from '../../domain/ports';
import type { Transaction } from '../../domain/investments.types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(userId: string, limit: number = DEFAULT_LIMIT): Promise<Transaction[]> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) throw new Error('userId is required');

    const safeLimit = Math.min(Math.max(1, Math.floor(limit) || DEFAULT_LIMIT), MAX_LIMIT);
    return this.transactionRepository.findByUserId(uid, safeLimit);
  }
}
