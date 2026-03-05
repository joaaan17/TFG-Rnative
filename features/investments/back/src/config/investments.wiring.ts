/**
 * Wiring de la feature Investments: cartera, órdenes de compra e historial.
 * Integra el servicio de precios de market (getQuotesUseCase) y caché de históricos (priceCacheService).
 */
import {
  getQuotesUseCase,
  priceCacheService,
} from '../../../../market/back/src/config/market.wiring';
import { GetOrCreatePortfolioUseCase } from '../application/usecases/get-or-create-portfolio.usecase';
import { ExecuteBuyOrderUseCase } from '../application/usecases/execute-buy-order.usecase';
import { ExecuteSellOrderUseCase } from '../application/usecases/execute-sell-order.usecase';
import { GetTransactionsUseCase } from '../application/usecases/get-transactions.usecase';
import { GetPortfolioOverviewUseCase } from '../application/usecases/get-portfolio-overview.usecase';
import { GetDashboardSummaryUseCase } from '../application/usecases/get-dashboard-summary.usecase';
import { PortfolioAnalyticsService } from '../application/services/portfolio-analytics.service';
import { MarketQuoteAdapter } from '../infrastructure/adapters/market-quote.adapter';
import { MarketQuotesAdapter } from '../infrastructure/adapters/market-quotes.adapter';
import { createHistoricalDailyAdapter } from '../infrastructure/adapters/historical-daily.adapter';
import { createHistoricalHourlyAdapter } from '../infrastructure/adapters/historical-hourly.adapter';
import { MongoPortfolioRepository } from '../infrastructure/persistence/mongo/portfolio.repository';
import { MongoTransactionRepository } from '../infrastructure/persistence/mongo/transaction.repository';

const initialCash = Number(process.env.PORTFOLIO_INITIAL_CASH) || 10_000;

const portfolioRepository = new MongoPortfolioRepository(initialCash);
const transactionRepository = new MongoTransactionRepository();

const getQuoteAdapter = new MarketQuoteAdapter(async (symbols) => {
  const items = await getQuotesUseCase.execute(symbols);
  return items.map((q) => ({ symbol: q.symbol, price: q.price }));
});

const getQuotesAdapter = new MarketQuotesAdapter(async (symbols) => {
  const items = await getQuotesUseCase.execute(symbols);
  return items.map((q) => ({ symbol: q.symbol, price: q.price }));
});

export const getOrCreatePortfolioUseCase = new GetOrCreatePortfolioUseCase(
  portfolioRepository,
  initialCash,
);
export const executeBuyOrderUseCase = new ExecuteBuyOrderUseCase(
  getQuoteAdapter,
  portfolioRepository,
  transactionRepository,
);
export const executeSellOrderUseCase = new ExecuteSellOrderUseCase(
  getQuoteAdapter,
  portfolioRepository,
  transactionRepository,
);
export const getTransactionsUseCase = new GetTransactionsUseCase(
  transactionRepository,
);
export const getPortfolioOverviewUseCase = new GetPortfolioOverviewUseCase(
  portfolioRepository,
  getQuotesAdapter,
  transactionRepository,
);

function getPortfolioOverviewFn(
  userId: string,
  timeframe: string,
  range: string,
): ReturnType<GetPortfolioOverviewUseCase['execute']> {
  console.log('[wiring] getPortfolioOverviewFn called', {
    userId,
    timeframe,
    range,
  });
  return getPortfolioOverviewUseCase.execute(
    userId,
    timeframe as Parameters<GetPortfolioOverviewUseCase['execute']>[1],
    range as Parameters<GetPortfolioOverviewUseCase['execute']>[2],
  );
}

console.log(
  '[wiring] getPortfolioOverviewFn typeof=',
  typeof getPortfolioOverviewFn,
  'isFunction=',
  typeof getPortfolioOverviewFn === 'function',
);

const getHistorical = (
  symbol: string,
  interval: string,
  range: string,
  strategy?: 'swr' | 'cache-first' | 'network-first',
  requestId?: string,
) =>
  priceCacheService.getHistorical(
    symbol,
    interval,
    range,
    strategy ?? 'swr',
    requestId,
  );

const historicalDailyAdapter = createHistoricalDailyAdapter(getHistorical);
const historicalHourlyAdapter = createHistoricalHourlyAdapter(getHistorical);

export const portfolioAnalyticsService = new PortfolioAnalyticsService(
  transactionRepository,
  historicalDailyAdapter,
  historicalHourlyAdapter,
  initialCash,
);

console.log(
  '[wiring] Creating getDashboardSummaryUseCase with getPortfolioOverviewFn',
);
export const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(
  portfolioRepository,
  getPortfolioOverviewFn,
  transactionRepository,
  (userId: string) =>
    portfolioAnalyticsService
      .getPerformance(userId, '1D')
      .then((r) => ({ points: r.points })),
);
console.log('[wiring] getDashboardSummaryUseCase created');
