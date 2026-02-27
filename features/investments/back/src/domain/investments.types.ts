/**
 * Tipos del dominio Investments: cartera, holdings y transacciones.
 * Moneda base: USD (operaciones en dólares).
 */

export const PORTFOLIO_CURRENCY = 'USD' as const;

export interface Holding {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  lastUpdatedAt: Date;
}

export interface Portfolio {
  _id: string;
  userId: string;
  cashBalance: number;
  currency: string;
  holdings: Holding[];
}

export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  _id: string;
  userId: string;
  symbol: string;
  type: TransactionType;
  shares: number;
  price: number;
  total: number;
  executedAt: Date;
}

/** Respuesta de GET portfolio (para API). */
export interface PortfolioResponse {
  cashBalance: number;
  currency: string;
  holdings: Array<{
    symbol: string;
    shares: number;
    avgBuyPrice: number;
    lastUpdatedAt: string;
  }>;
}

/** Body de POST orders/buy. */
export interface BuyOrderBody {
  symbol: string;
  shares: number;
  /** Opcional: precio mostrado en UI; el servidor valida contra precio real. */
  clientPrice?: number;
}
