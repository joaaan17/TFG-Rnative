import { SearchMarketUseCase } from '../application/usecases/search-market.usecase';
import { YahooFinanceMarketSearchAdapter } from '../infrastructure/providers/yahoo-finance.market-search.adapter';

const marketSearchAdapter = new YahooFinanceMarketSearchAdapter();

export const searchMarketUseCase = new SearchMarketUseCase(marketSearchAdapter);
