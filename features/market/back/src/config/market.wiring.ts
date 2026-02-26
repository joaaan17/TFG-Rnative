import { GetCandlesUseCase } from '../application/usecases/get-candles.usecase';
import { SearchMarketUseCase } from '../application/usecases/search-market.usecase';
import { YahooFinanceMarketCandlesAdapter } from '../infrastructure/providers/yahoo-finance.market-candles.adapter';
import { YahooFinanceMarketSearchAdapter } from '../infrastructure/providers/yahoo-finance.market-search.adapter';

const marketSearchAdapter = new YahooFinanceMarketSearchAdapter();
const marketCandlesAdapter = new YahooFinanceMarketCandlesAdapter();

export const searchMarketUseCase = new SearchMarketUseCase(marketSearchAdapter);
export const getCandlesUseCase = new GetCandlesUseCase(marketCandlesAdapter);
