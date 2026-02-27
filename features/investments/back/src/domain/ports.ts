/**
 * Ports de la feature Investments.
 */

import type {
  Holding,
  Portfolio,
  Transaction,
} from './investments.types';

/** Vela diaria: t en ms, c = cierre. Para equity curve desde caché global. */
export interface DailyCandle {
  t: number;
  c: number;
}

/** Obtiene histórico diario (1d) desde el caché global. range: 1mo|3mo|6mo|1y */
export interface GetHistoricalDailyPort {
  getHistoricalDaily(
    symbol: string,
    range: string,
    requestId?: string,
  ): Promise<{ candles: DailyCandle[]; cacheStatus: string }>;
}

/** Obtiene histórico horario (1h) para vista 1D. range: 5d */
export interface GetHistoricalHourlyPort {
  getHistoricalHourly(
    symbol: string,
    range: string,
    requestId?: string,
  ): Promise<{ candles: DailyCandle[]; cacheStatus: string }>;
}

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
  /** Todas las transacciones con executedAt <= beforeOrAt, ordenadas por executedAt asc (para simulación de equity). */
  findByUserIdExecutedBefore(userId: string, beforeOrAt: Date): Promise<Transaction[]>;
}
