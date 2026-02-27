/**
 * Pruebas unitarias del cálculo de equity curve.
 * Mock de TransactionRepository y GetHistoricalDailyPort.
 */
import { describe, it, expect } from 'vitest';
import type {
  GetHistoricalDailyPort,
  TransactionRepository,
} from '../../domain/ports';
import type { Transaction } from '../../domain/investments.types';
import { PortfolioAnalyticsService } from './portfolio-analytics.service';

const INITIAL_CASH = 10_000;

function tx(
  symbol: string,
  type: 'BUY' | 'SELL',
  shares: number,
  price: number,
  executedAt: Date,
  avgBuyPrice?: number,
): Transaction {
  const total = Math.round(shares * price * 100) / 100;
  return {
    _id: `tx-${executedAt.getTime()}`,
    userId: 'user1',
    symbol,
    type,
    shares,
    price,
    total,
    executedAt,
    ...(avgBuyPrice != null && { avgBuyPrice }),
  };
}

describe('PortfolioAnalyticsService', () => {
  describe('getPerformance (equity curve)', () => {
    it('devuelve puntos con equity, cash y positions', async () => {
      const buyDate = new Date();
      buyDate.setDate(buyDate.getDate() - 5);
      const transactions: Transaction[] = [tx('AAPL', 'BUY', 5, 200, buyDate)];
      const end = new Date();
      const startMs = end.getTime() - 31 * 24 * 60 * 60 * 1000;
      const candles: { t: number; c: number }[] = [];
      for (let i = 0; i < 35; i++) {
        const t = startMs + i * 24 * 60 * 60 * 1000;
        candles.push({ t, c: 200 + i });
      }
      const mockRepo: TransactionRepository = {
        create: async () => transactions[0],
        findByUserId: async () => [],
        findByUserIdBetween: async () => [],
        findByUserIdExecutedBefore: async () => transactions,
      };
      const mockHistorical: GetHistoricalDailyPort = {
        getHistoricalDaily: async () => ({ candles, cacheStatus: 'HIT_L1' }),
      };
      const service = new PortfolioAnalyticsService(
        mockRepo,
        mockHistorical,
        null,
        INITIAL_CASH,
      );
      const { points, symbolsUsed } = await service.getPerformance(
        'user1',
        '1M',
      );
      expect(symbolsUsed).toContain('AAPL');
      expect(points.length).toBeGreaterThan(0);
      const first = points[0];
      expect(first).toHaveProperty('t');
      expect(first).toHaveProperty('equity');
      expect(first).toHaveProperty('cash');
      expect(first).toHaveProperty('positions');
      expect(first).toHaveProperty('invested');
      expect(typeof first.equity).toBe('number');
      expect(typeof first.cash).toBe('number');
      expect(typeof first.positions).toBe('number');
      expect(typeof first.invested).toBe('number');
      expect(first.equity).toBeCloseTo(first.cash + first.positions, 2);
    });

    it('equity = cash + positions en cada punto', async () => {
      const mockRepo: TransactionRepository = {
        create: async () => ({}) as Transaction,
        findByUserId: async () => [],
        findByUserIdBetween: async () => [],
        findByUserIdExecutedBefore: async () => [],
      };
      const mockHistorical: GetHistoricalDailyPort = {
        getHistoricalDaily: async () => ({
          candles: [],
          cacheStatus: 'HIT_L1',
        }),
      };
      const service = new PortfolioAnalyticsService(
        mockRepo,
        mockHistorical,
        null,
        INITIAL_CASH,
      );
      const { points } = await service.getPerformance('user1', '1M');
      for (const p of points) {
        expect(p.equity).toBeCloseTo(p.cash + p.positions, 2);
        expect(p).toHaveProperty('invested');
      }
    });
  });
});
