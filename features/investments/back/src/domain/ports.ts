/**
 * Ports de la feature Investments.
 */

import type { Holding, Portfolio, Transaction } from './investments.types';

export interface GetQuoteResult {
  price: number;
  timestamp?: Date;
}

/** Obtiene el precio actual de un símbolo (integración con servicio de precios). */
export interface GetQuotePort {
  getQuote(symbol: string): Promise<GetQuoteResult | null>;
}

/** Obtiene precios de varios símbolos (para allocation/overview). */
export interface GetQuotesPort {
  getQuotes(symbols: string[]): Promise<Array<{ symbol: string; price: number | null }>>;
}

export interface PortfolioRepository {
  findByUserId(userId: string): Promise<Portfolio | null>;
  create(userId: string, cashBalance: number, currency: string): Promise<Portfolio>;
  updateCashAndHoldings(
    userId: string,
    newCashBalance: number,
    holdings: Holding[],
  ): Promise<Portfolio | null>;
}

export interface TransactionRepository {
  create(
    userId: string,
    symbol: string,
    type: 'BUY' | 'SELL',
    shares: number,
    price: number,
    total: number,
    avgBuyPrice?: number,
  ): Promise<Transaction>;
  findByUserId(userId: string, limit: number): Promise<Transaction[]>;
  findByUserIdBetween(userId: string, from: Date, to: Date): Promise<Transaction[]>;
}
