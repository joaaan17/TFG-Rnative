import type { Request, Response } from 'express';
import {
  getOrCreatePortfolioUseCase,
  executeBuyOrderUseCase,
  executeSellOrderUseCase,
  getTransactionsUseCase,
} from '../config/investments.wiring';
import { InsufficientCashError } from '../application/usecases/execute-buy-order.usecase';
import { InsufficientSharesError } from '../application/usecases/execute-sell-order.usecase';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';

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
export const getPortfolioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const result = await getOrCreatePortfolioUseCase.execute(userId);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al obtener la cartera';
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
 * Body: { symbol: string, shares: number, clientPrice?: number }
 * Ejecuta una compra usando el precio actual del servidor. Retorna cartera actualizada y transacción.
 */
export const postBuyOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = req.body ?? {};
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim() : '';
    const shares = typeof body.shares === 'number' ? body.shares : Number(body.shares);

    if (!symbol) {
      res.status(400).json({ message: 'symbol es obligatorio' });
      return;
    }
    if (!Number.isFinite(shares) || shares <= 0) {
      res.status(400).json({ message: 'shares debe ser un número mayor que 0' });
      return;
    }

    const requestId = typeof req.headers['x-request-id'] === 'string'
      ? req.headers['x-request-id']
      : undefined;

    const { updatedPortfolio, createdTransaction } = await executeBuyOrderUseCase.execute(
      userId,
      symbol.toUpperCase(),
      shares,
      requestId,
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
    const message = err instanceof Error ? err.message : 'Error al ejecutar la compra';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    if (message.includes('Precio no disponible') || message.includes('symbol') || message.includes('shares')) {
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
 * Body: { symbol: string, shares: number }
 * Ejecuta una venta usando el precio actual del servidor. Retorna cartera actualizada y transacción.
 */
export const postSellOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const body = req.body ?? {};
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim() : '';
    const shares = typeof body.shares === 'number' ? body.shares : Number(body.shares);

    if (!symbol) {
      res.status(400).json({ message: 'symbol es obligatorio' });
      return;
    }
    if (!Number.isFinite(shares) || shares <= 0) {
      res.status(400).json({ message: 'shares debe ser un número mayor que 0' });
      return;
    }

    const requestId = typeof req.headers['x-request-id'] === 'string'
      ? req.headers['x-request-id']
      : undefined;

    const { updatedPortfolio, createdTransaction } = await executeSellOrderUseCase.execute(
      userId,
      symbol.toUpperCase(),
      shares,
      requestId,
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
    const message = err instanceof Error ? err.message : 'Error al ejecutar la venta';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    if (message.includes('Precio no disponible') || message.includes('symbol') || message.includes('shares')) {
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
 * GET /api/investments/transactions/me?limit=50
 * Historial de transacciones del usuario autenticado.
 */
export const getTransactionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 50;
    const transactions = await getTransactionsUseCase.execute(userId, limit);
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
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al obtener transacciones';
    if (message.includes('required') || message.includes('autenticado')) {
      res.status(401).json({ message });
      return;
    }
    console.error('[investments] getTransactions error:', err);
    res.status(500).json({ message: 'Error al obtener transacciones' });
  }
};
