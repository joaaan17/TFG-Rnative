import type {
  IndicatorCalculator,
  MarketDataProvider,
} from '../../domain/ports';
import type { MarketChartData } from '../../domain/market-chart.types';

export interface GetMarketChartParams {
  symbol: string;
  interval: string;
  from: number;
  to: number;
}

export class GetMarketChartUseCase {
  constructor(
    private marketData: MarketDataProvider,
    private indicators: IndicatorCalculator,
  ) {}

  async execute(params: GetMarketChartParams): Promise<MarketChartData> {
    const { symbol, interval, from, to } = params;
    const candles = await this.marketData.getCandles(
      symbol,
      interval,
      from,
      to,
    );

    const rsi = this.indicators.calculateRSI(candles);
    const macd = this.indicators.calculateMACD(candles);

    return {
      candles,
      indicators: [rsi, macd],
    };
  }
}
