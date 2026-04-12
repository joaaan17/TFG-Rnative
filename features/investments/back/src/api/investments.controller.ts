import type { Request, Response } from 'express';
import {
  getOrCreatePortfolioUseCase,
  executeBuyOrderUseCase,
  executeSellOrderUseCase,
  getTransactionsUseCase,
  getPortfolioOverviewUseCase,
  getDashboardSummaryUseCase,
  portfolioAnalyticsService,
} from '../config/investments.wiring';
import type {
  TimeframeParam,
  RangeParam,
} from '../application/usecases/get-portfolio-overview.usecase';
import { InsufficientCashError } from '../application/usecases/execute-buy-order.usecase';
import { InsufficientSharesError } from '../application/usecases/execute-sell-order.usecase';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import type { PerformanceRange } from '../domain/investments.types';

function getUserId(req: Request): string {
  const id = req.auth?.userId;
  if (!id || typeof id !== 'string') {
    throw new Error('Usuario no autenticado');
  }
  return id;
}

/**
 * GET /api/investments/portfolio/me
 * Obtiene la cartera del usuario autenticado. Si no existe, la crea con saldo inicial.
 */
const VALID_PERFORMANCE_RANGES: PerformanceRange[] = [
  '1D',
  '1W',
  '1M',
  '3M',
  '6M',
  '1Y',
];

function parsePerformanceRange(q: unknown): PerformanceRange {
  const s = typeof q === 'string' ? q.trim().toUpperCase() : '';
  if (VALID_PERFORMANCE_RANGES.includes(s as PerformanceRange))
    return s as PerformanceRange;
  return '1M';
}

export const getPortfolioController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const result = await getOrCreatePortfolioUseCase.execute(userId);
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener la cartera';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getPortfolio error:', err);
    res.status(500).json({ message: 'Error al obtener la cartera' });
  }
};

/**
 * POST /api/investments/orders/buy
 * Body: { symbol: string, shares: number, price?: number }
 * Ejecuta una compra. Si se envía price (mismo que "Valor actual" en el modal: 6h → quote), se usa para la transacción y precio medio compra; si no, el servidor usa el quote. Así el precio de compra registrado coincide con lo que ve el usuario.
 */
export const postBuyOrderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = req.body ?? {};
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim() : '';
    const shares =
      typeof body.shares === 'number' ? body.shares : Number(body.shares);
    const priceFromClient =
      typeof body.price === 'number' &&
      Number.isFinite(body.price) &&
      body.price > 0
        ? body.price
        : undefined;

    if (!symbol) {
      res.status(400).json({ message: 'symbol es obligatorio' });
      return;
    }
    if (!Number.isFinite(shares) || shares <= 0) {
      res
        .status(400)
        .json({ message: 'shares debe ser un número mayor que 0' });
      return;
    }

    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;

    const { updatedPortfolio, createdTransaction } =
      await executeBuyOrderUseCase.execute(
        userId,
        symbol.toUpperCase(),
        shares,
        requestId,
        priceFromClient,
      );

    res.status(200).json({
      updatedPortfolio: {
        cashBalance: updatedPortfolio.cashBalance,
        currency: updatedPortfolio.currency,
        holdings: updatedPortfolio.holdings.map((h) => ({
          symbol: h.symbol,
          shares: h.shares,
          avgBuyPrice: h.avgBuyPrice,
          lastUpdatedAt: h.lastUpdatedAt.toISOString(),
        })),
      },
      createdTransaction: {
        _id: createdTransaction._id,
        userId: createdTransaction.userId,
        symbol: createdTransaction.symbol,
        type: createdTransaction.type,
        shares: createdTransaction.shares,
        price: createdTransaction.price,
        total: createdTransaction.total,
        executedAt: createdTransaction.executedAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof InsufficientCashError) {
      res.status(409).json({ message: err.message });
      return;
    }
    const message =
      err instanceof Error ? err.message : 'Error al ejecutar la compra';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    if (
      message.includes('Precio no disponible') ||
      message.includes('symbol') ||
      message.includes('shares')
    ) {
      res.status(400).json({ message });
      return;
    }
    if (message.includes('Cartera no encontrada')) {
      res.status(404).json({ message });
      return;
    }
    console.error('[investments] postBuyOrder error:', err);
    res.status(500).json({ message: 'Error al ejecutar la compra' });
  }
};

/**
 * POST /api/investments/orders/sell
 * Body: { symbol: string, shares: number, price?: number }
 * Ejecuta una venta. Si se envía price (mismo criterio que "Valor actual" en el modal: 6h → quote), se usa para la transacción; si no, el servidor usa el quote. Retorna cartera actualizada y transacción.
 */
export const postSellOrderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = req.body ?? {};
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim() : '';
    const shares =
      typeof body.shares === 'number' ? body.shares : Number(body.shares);
    const priceFromClient =
      typeof body.price === 'number' &&
      Number.isFinite(body.price) &&
      body.price > 0
        ? body.price
        : undefined;

    if (!symbol) {
      res.status(400).json({ message: 'symbol es obligatorio' });
      return;
    }
    if (!Number.isFinite(shares) || shares <= 0) {
      res
        .status(400)
        .json({ message: 'shares debe ser un número mayor que 0' });
      return;
    }

    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;

    const { updatedPortfolio, createdTransaction } =
      await executeSellOrderUseCase.execute(
        userId,
        symbol.toUpperCase(),
        shares,
        requestId,
        priceFromClient,
      );

    res.status(200).json({
      updatedPortfolio: {
        cashBalance: updatedPortfolio.cashBalance,
        currency: updatedPortfolio.currency,
        holdings: updatedPortfolio.holdings.map((h) => ({
          symbol: h.symbol,
          shares: h.shares,
          avgBuyPrice: h.avgBuyPrice,
          lastUpdatedAt: h.lastUpdatedAt.toISOString(),
        })),
      },
      createdTransaction: {
        _id: createdTransaction._id,
        userId: createdTransaction.userId,
        symbol: createdTransaction.symbol,
        type: createdTransaction.type,
        shares: createdTransaction.shares,
        price: createdTransaction.price,
        total: createdTransaction.total,
        executedAt: createdTransaction.executedAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof InsufficientSharesError) {
      res.status(409).json({ message: err.message });
      return;
    }
    const message =
      err instanceof Error ? err.message : 'Error al ejecutar la venta';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    if (
      message.includes('Precio no disponible') ||
      message.includes('symbol') ||
      message.includes('shares')
    ) {
      res.status(400).json({ message });
      return;
    }
    if (message.includes('Cartera no encontrada')) {
      res.status(404).json({ message });
      return;
    }
    console.error('[investments] postSellOrder error:', err);
    res.status(500).json({ message: 'Error al ejecutar la venta' });
  }
};

/**
 * GET /api/investments/portfolio/overview?timeframe=1d&range=6mo
 * Resumen de cartera: allocation y markers para gráficos.
 */
export const getPortfolioOverviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const timeframe = (
      typeof req.query.timeframe === 'string' ? req.query.timeframe : '1d'
    ) as TimeframeParam;
    const range = (
      typeof req.query.range === 'string' ? req.query.range : '6mo'
    ) as RangeParam;
    const result = await getPortfolioOverviewUseCase.execute(
      userId,
      timeframe,
      range,
    );
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Error al obtener resumen de cartera';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getPortfolioOverview error:', err);
    res.status(500).json({ message });
  }
};

/**
 * Para ventas sin avgBuyPrice (operaciones antiguas), estima el precio medio de compra
 * a partir de las compras del mismo símbolo anteriores a la venta (solo BUY, misma symbol, fecha < venta).
 */
function enrichSellsWithEstimatedAvgBuyPrice<
  T extends {
    _id: string;
    symbol: string;
    type: string;
    executedAt: Date;
    avgBuyPrice?: number;
    shares: number;
    total: number;
  },
>(transactions: T[]): T[] {
  const byDateAsc = [...transactions].sort(
    (a, b) =>
      new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime(),
  );
  return transactions.map((t) => {
    if (t.type !== 'SELL' || t.avgBuyPrice != null) return t;
    const sellTime = new Date(t.executedAt).getTime();
    let totalShares = 0;
    let totalCost = 0;
    for (const other of byDateAsc) {
      if ((other as T)._id === t._id) continue;
      if (other.symbol !== t.symbol || other.type !== 'BUY') continue;
      if (new Date(other.executedAt).getTime() >= sellTime) continue;
      totalShares += other.shares;
      totalCost += other.total;
    }
    if (totalShares <= 0) return t;
    const estimated = Math.round((totalCost / totalShares) * 100) / 100;
    return { ...t, avgBuyPrice: estimated };
  });
}

/**
 * GET /api/investments/transactions/me?limit=50
 * Historial de transacciones del usuario autenticado.
 * Para ventas antiguas sin avgBuyPrice se estima a partir de compras previas del mismo símbolo.
 */
export const getTransactionsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const limitParam = req.query.limit;
    const limit =
      typeof limitParam === 'string' ? parseInt(limitParam, 10) : 50;
    let transactions = await getTransactionsUseCase.execute(userId, limit);
    transactions = enrichSellsWithEstimatedAvgBuyPrice(transactions);
    res.status(200).json({
      transactions: transactions.map((t) => ({
        _id: t._id,
        userId: t.userId,
        symbol: t.symbol,
        type: t.type,
        shares: t.shares,
        price: t.price,
        total: t.total,
        executedAt: t.executedAt.toISOString(),
        ...(t.avgBuyPrice != null && { avgBuyPrice: t.avgBuyPrice }),
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener transacciones';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getTransactions error:', err);
    res.status(500).json({ message: 'Error al obtener transacciones' });
  }
};

/**
 * GET /api/investments/cash/overview
 * Resumen de efectivo: balance, entradas/salidas del mes y últimas transacciones.
 * Pensado para la pantalla "Efectivo" (neobanco). Opcional: el front puede usar portfolio/me + transactions/me.
 */
export const getCashOverviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const [portfolio, rawTransactions] = await Promise.all([
      getOrCreatePortfolioUseCase.execute(userId),
      getTransactionsUseCase.execute(userId, 100),
    ]);
    const transactions = enrichSellsWithEstimatedAvgBuyPrice(rawTransactions);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let monthlyIn = 0;
    let monthlyOut = 0;
    for (const t of transactions) {
      if (t.executedAt < startOfMonth) continue;
      if (t.type === 'SELL') monthlyIn += t.total;
      else if (t.type === 'BUY') monthlyOut += t.total;
    }

    res.status(200).json({
      balance: portfolio.cashBalance,
      currency: portfolio.currency,
      monthlyIn,
      monthlyOut,
      monthlyFees: 0,
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.type === 'BUY' ? -t.total : t.total,
        currency: portfolio.currency,
        createdAt: t.executedAt.toISOString(),
        status: 'completed',
        symbol: t.symbol,
        quantity: t.shares,
        price: t.price,
        fee: undefined,
        ...(t.avgBuyPrice != null && { avgBuyPrice: t.avgBuyPrice }),
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener efectivo';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getCashOverview error:', err);
    res.status(500).json({ message: 'Error al obtener efectivo' });
  }
};

/**
 * GET /api/investments/portfolio/summary?userId=optional
 * Resumen y contexto para el Dashboard (usuario autenticado).
 * Si `userId` en query es un id válido, devuelve el mismo resumen para **ese** usuario
 * (p. ej. perfil de amigo), sin rutas extra — así el endpoint funciona aunque el proceso
 * no haya recargado rutas nuevas.
 */
export const getDashboardSummaryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const q = req.query.userId;
    const forOther =
      typeof q === 'string' && q.trim().length > 0 ? q.trim() : undefined;
    const targetUserId = forOther ?? userId;
    console.log(
      '[investments] getDashboardSummaryController: calling useCase.execute for userId=',
      targetUserId,
      forOther ? '(query userId)' : '(self)',
    );
    const result = await getDashboardSummaryUseCase.execute(targetUserId);
    console.log('[investments] getDashboardSummaryController: success');
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Error al obtener resumen del dashboard';
    if (message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getDashboardSummary error:', err);
    res.status(500).json({ message });
  }
};

/**
 * GET /api/investments/portfolio/performance?range=1M|3M|6M|1Y
 * Equity curve: valor total cartera (cash + posiciones) en el tiempo.
 */
export const getPerformanceController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const start = Date.now();
  try {
    const userId = getUserId(req);
    const range = parsePerformanceRange(req.query.range);
    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;
    const { points, symbolsUsed, cacheStatuses } =
      await portfolioAnalyticsService.getPerformance(userId, range, requestId);
    const cacheStatus = cacheStatuses.every(
      (s) => s === 'HIT_L1' || s === 'HIT_L2',
    )
      ? 'HIT'
      : cacheStatuses.some((s) => s === 'MISS_FETCH')
        ? 'MISS'
        : 'PARTIAL';
    const took = Date.now() - start;
    console.log(
      `[API] GET /portfolio/performance range=${range} user=${userId} status=200 took=${took}ms`,
    );
    res.status(200).json({
      range,
      points,
      meta: {
        computedAt: new Date().toISOString(),
        cacheStatus,
        symbolsUsed,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener performance';
    if (message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getPerformance error:', err);
    res.status(500).json({ message });
  }
};
