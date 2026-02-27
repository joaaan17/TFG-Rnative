import type { GetQuotePort, PortfolioRepository, TransactionRepository } from '../../domain/ports';
import type { Holding, Portfolio, Transaction } from '../../domain/investments.types';

const MIN_SHARES = 0.0001;
const MAX_SYMBOL_LENGTH = 15;

export class InsufficientCashError extends Error {
  constructor(message = 'Fondos insuficientes') {
    super(message);
    this.name = 'InsufficientCashError';
  }
}

export class ExecuteBuyOrderUseCase {
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
    /** Precio opcional desde el cliente (mismo que "Valor actual" en el modal: 6h → quote). Si es válido, se usa para la transacción y precio medio compra; si no, se usa el quote del servidor. */
    priceFromClient?: number,
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

    const hasValidClientPrice =
      typeof priceFromClient === 'number' &&
      Number.isFinite(priceFromClient) &&
      priceFromClient > 0;
    let price: number;
    if (hasValidClientPrice) {
      price = priceFromClient;
    } else {
      const quote = await this.getQuote.getQuote(sym);
      if (!quote?.price || !Number.isFinite(quote.price)) {
        throw new Error('Precio no disponible para este activo');
      }
      price = quote.price;
    }
    const totalCost = Math.round(shares * price * 100) / 100;

    const portfolio = await this.portfolioRepository.findByUserId(uid);
    if (!portfolio) {
      throw new Error('Cartera no encontrada. Obtén la cartera primero (GET /portfolio/me).');
    }

    if (portfolio.cashBalance < totalCost) {
      throw new InsufficientCashError('Fondos insuficientes');
    }

    const now = new Date();
    const existingHoldings = [...portfolio.holdings];
    const existingIndex = existingHoldings.findIndex((h) => h.symbol === sym);
    let newHoldings: Holding[];

    if (existingIndex >= 0) {
      const old = existingHoldings[existingIndex];
      const newShares = old.shares + shares;
      const newAvg =
        newShares > 0
          ? (old.shares * old.avgBuyPrice + shares * price) / newShares
          : old.avgBuyPrice;
      newHoldings = existingHoldings.map((h, i) =>
        i === existingIndex
          ? {
              symbol: h.symbol,
              shares: newShares,
              avgBuyPrice: Math.round(newAvg * 100) / 100,
              lastUpdatedAt: now,
            }
          : h,
      );
    } else {
      newHoldings = [
        ...existingHoldings,
        { symbol: sym, shares, avgBuyPrice: price, lastUpdatedAt: now },
      ];
    }

    const newCashBalance = Math.round((portfolio.cashBalance - totalCost) * 100) / 100;

    const [createdTransaction, updatedPortfolio] = await Promise.all([
      this.transactionRepository.create(uid, sym, 'BUY', shares, price, totalCost),
      this.portfolioRepository.updateCashAndHoldings(uid, newCashBalance, newHoldings),
    ]);

    if (!updatedPortfolio) {
      throw new Error('Error al actualizar la cartera');
    }

    if (requestId) {
      console.log(`[orders] requestId=${requestId} userId=${uid} symbol=${sym} shares=${shares} total=${totalCost} BUY executed`);
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
