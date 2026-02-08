import { GetMarketChartUseCase } from '../application/usecases/get-market-chart';
import { MockMarketDataProvider } from '../infrastructure/marketData/mockMarketData';
import { SimpleIndicatorCalculator } from '../infrastructure/indicators/simpleIndicatorCalculator';

const marketDataProvider = new MockMarketDataProvider();
const indicatorCalculator = new SimpleIndicatorCalculator();

export const getMarketChartUseCase = new GetMarketChartUseCase(
  marketDataProvider,
  indicatorCalculator,
);
