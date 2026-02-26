import { GetCandlesUseCase } from '../application/usecases/get-candles.usecase';
import { GetMarketOverviewUseCase } from '../application/usecases/get-market-overview.usecase';
import { GetQuotesUseCase } from '../application/usecases/get-quotes.usecase';
import { SearchMarketUseCase } from '../application/usecases/search-market.usecase';
import { YahooFinanceMarketCandlesAdapter } from '../infrastructure/providers/yahoo-finance.market-candles.adapter';
import { YahooFinanceMarketOverviewAdapter } from '../infrastructure/providers/yahoo-finance.market-overview.adapter';
import { YahooFinanceMarketQuotesAdapter } from '../infrastructure/providers/yahoo-finance.market-quotes.adapter';
import { YahooFinanceMarketSearchAdapter } from '../infrastructure/providers/yahoo-finance.market-search.adapter';

const marketSearchAdapter = new YahooFinanceMarketSearchAdapter();
const marketCandlesAdapter = new YahooFinanceMarketCandlesAdapter();
const marketQuotesAdapter = new YahooFinanceMarketQuotesAdapter();
const marketOverviewAdapter = new YahooFinanceMarketOverviewAdapter();

export const searchMarketUseCase = new SearchMarketUseCase(marketSearchAdapter);
export const getCandlesUseCase = new GetCandlesUseCase(marketCandlesAdapter);
export const getQuotesUseCase = new GetQuotesUseCase(marketQuotesAdapter);
export const getMarketOverviewUseCase = new GetMarketOverviewUseCase(marketOverviewAdapter);
