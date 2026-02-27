/**
 * Wiring de la feature Investments: cartera, órdenes de compra e historial.
 * Integra el servicio de precios de market (getQuotesUseCase).
 */
import { getQuotesUseCase } from '../../../../market/back/src/config/market.wiring';
import { GetOrCreatePortfolioUseCase } from '../application/usecases/get-or-create-portfolio.usecase';
import { ExecuteBuyOrderUseCase } from '../application/usecases/execute-buy-order.usecase';
import { ExecuteSellOrderUseCase } from '../application/usecases/execute-sell-order.usecase';
import { GetTransactionsUseCase } from '../application/usecases/get-transactions.usecase';
import { GetPortfolioOverviewUseCase } from '../application/usecases/get-portfolio-overview.usecase';
import { MarketQuoteAdapter } from '../infrastructure/adapters/market-quote.adapter';
import { MarketQuotesAdapter } from '../infrastructure/adapters/market-quotes.adapter';
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
export const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
export const getPortfolioOverviewUseCase = new GetPortfolioOverviewUseCase(
  portfolioRepository,
  getQuotesAdapter,
  transactionRepository,
);
