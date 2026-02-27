import type { CandlesResponse } from '../domain/market.types';
import { GetCandlesByTimeframeUseCase } from '../application/usecases/get-candles-by-timeframe.usecase';
import { GetCandlesUseCase } from '../application/usecases/get-candles.usecase';
import { GetMarketOverviewUseCase } from '../application/usecases/get-market-overview.usecase';
import { GetQuotesUseCase } from '../application/usecases/get-quotes.usecase';
import { SearchMarketUseCase } from '../application/usecases/search-market.usecase';
import { PriceCacheService } from '../infrastructure/cache/price-cache.service';
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
export const getCandlesByTimeframeUseCase = new GetCandlesByTimeframeUseCase(marketCandlesAdapter);
export const getQuotesUseCase = new GetQuotesUseCase(marketQuotesAdapter);
export const getMarketOverviewUseCase = new GetMarketOverviewUseCase(marketOverviewAdapter);

export const priceCacheService = new PriceCacheService({
  fetchQuotes: (symbols) => getQuotesUseCase.execute(symbols),
  fetchCandles: async (symbol, interval, range) => {
    if (interval === '1h') {
      const candles = await getCandlesUseCase.execute({
        symbol,
        range: range as '1d' | '5d' | '1wk' | '1mo' | '3mo' | '6mo' | '1y',
        interval: '1h',
      });
      return {
        symbol,
        timeframe: '1d',
        range,
        interval: '1d',
        count: candles.length,
        candles,
      } as CandlesResponse;
    }
    return getCandlesByTimeframeUseCase.execute(
      symbol,
      interval as '6h' | '1d' | '1mo',
      range,
    );
  },
});
