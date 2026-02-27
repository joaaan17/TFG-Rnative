import type { GetQuotePort, PortfolioRepository, TransactionRepository } from '../../domain/ports';
import type { Holding, Portfolio, Transaction } from '../../domain/investments.types';

const MIN_SHARES = 0.0001;
const MAX_SYMBOL_LENGTH = 15;

export class InsufficientSharesError extends Error {
  constructor(message = 'No tienes suficientes acciones para vender') {
    super(message);
    this.name = 'InsufficientSharesError';
  }
}

export class ExecuteSellOrderUseCase {
  constructor(
    private readonly getQuote: GetQuotePort,
    private readonly portfolioRepository: PortfolioRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    userId: string,
    symbol: string,
    shares: number,
    requestId?: string,
  ): Promise<{ updatedPortfolio: Portfolio; createdTransaction: Transaction }> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) throw new Error('userId is required');

    const sym = typeof symbol === 'string' ? symbol.trim().toUpperCase() : '';
    if (!sym || sym.length > MAX_SYMBOL_LENGTH) {
      throw new Error('symbol is required and must be at most 15 characters');
    }

    if (!Number.isFinite(shares) || shares < MIN_SHARES) {
      throw new Error('shares must be greater than 0');
    }

    const portfolio = await this.portfolioRepository.findByUserId(uid);
    if (!portfolio) {
      throw new Error('Cartera no encontrada. Obtén la cartera primero (GET /portfolio/me).');
    }

    const holdingIndex = portfolio.holdings.findIndex((h) => h.symbol === sym);
    if (holdingIndex < 0) {
      throw new InsufficientSharesError('No tienes posición en este activo');
    }

    const holding = portfolio.holdings[holdingIndex];
    if (holding.shares < shares) {
      throw new InsufficientSharesError('No tienes suficientes acciones para vender');
    }

    const quote = await this.getQuote.getQuote(sym);
    if (!quote?.price || !Number.isFinite(quote.price)) {
      throw new Error('Precio no disponible para este activo');
    }

    const price = quote.price;
    const totalProceeds = Math.round(shares * price * 100) / 100;

    const now = new Date();
    const newHoldings: Holding[] = [...portfolio.holdings];
    const remainingShares = Math.round((holding.shares - shares) * 10000) / 10000;

    if (remainingShares <= 0) {
      newHoldings.splice(holdingIndex, 1);
    } else {
      newHoldings[holdingIndex] = {
        symbol: holding.symbol,
        shares: remainingShares,
        avgBuyPrice: holding.avgBuyPrice,
        lastUpdatedAt: now,
      };
    }

    const newCashBalance = Math.round((portfolio.cashBalance + totalProceeds) * 100) / 100;

    const [createdTransaction, updatedPortfolio] = await Promise.all([
      this.transactionRepository.create(
        uid,
        sym,
        'SELL',
        shares,
        price,
        totalProceeds,
        holding.avgBuyPrice,
      ),
      this.portfolioRepository.updateCashAndHoldings(uid, newCashBalance, newHoldings),
    ]);

    if (!updatedPortfolio) {
      throw new Error('Error al actualizar la cartera');
    }

    if (requestId) {
      console.log(`[orders] requestId=${requestId} userId=${uid} symbol=${sym} shares=${shares} total=${totalProceeds} SELL executed`);
    }

    return {
      updatedPortfolio: {
        ...updatedPortfolio,
        holdings: updatedPortfolio.holdings.map((h) => ({
          ...h,
          lastUpdatedAt: h.lastUpdatedAt instanceof Date ? h.lastUpdatedAt : new Date(h.lastUpdatedAt),
        })),
      },
      createdTransaction: {
        ...createdTransaction,
        executedAt:
          createdTransaction.executedAt instanceof Date
            ? createdTransaction.executedAt
            : new Date(createdTransaction.executedAt),
      },
    };
  }
}
