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
  /** Precio medio de compra en el momento de la venta (solo para type SELL). Para calcular beneficio/pérdida por acción. */
  avgBuyPrice?: number;
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

/** Item de asignación para composición de cartera (overview). */
export interface AllocationItem {
  symbol: string;
  name: string;
  value: number;
  weight: number;
}

/** Marcador de transacciones por bucket de tiempo (para gráficos). */
export interface PortfolioMarker {
  t: number;
  side: 'BUY' | 'SELL';
  count: number;
  amount: number;
}

/** Resumen de cartera para la API de overview. */
export interface PortfolioOverview {
  totalValue: number;
  allocation: AllocationItem[];
  markers: PortfolioMarker[];
}

/** Rango para analytics (equity curve). */
export type PerformanceRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

/** Punto de la curva de equity (GET performance). */
export interface PerformancePoint {
  t: string; // ISODate
  equity: number;
  cash: number;
  positions: number;
  /** Dinero invertido en el mercado (capital salido de efectivo = initialCash - cash). */
  invested: number;
}

/** Respuesta GET portfolio/performance. */
export interface PerformanceResponse {
  range: PerformanceRange;
  points: PerformancePoint[];
  meta: {
    computedAt: string;
    cacheStatus: string;
    symbolsUsed: string[];
  };
}
