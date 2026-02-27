import type { GetHistoricalDailyPort } from '../../domain/ports';

/**
 * Adaptador que usa el caché global de market (PriceCacheService) para histórico diario.
 * interval = 1d, range = 1mo|3mo|6mo|1y.
 */
export function createHistoricalDailyAdapter(
  getHistorical: (
    symbol: string,
    interval: string,
    range: string,
    strategy?: 'swr' | 'cache-first' | 'network-first',
    requestId?: string,
  ) => Promise<{ data: { candles: Array<{ t: number; c: number }> }; cacheStatus: string }>,
): GetHistoricalDailyPort {
  return {
    async getHistoricalDaily(symbol, range, requestId) {
      const { data, cacheStatus } = await getHistorical(
        symbol,
        '1d',
        range,
        'swr',
        requestId,
      );
      return {
        candles: (data.candles ?? []).map((c) => ({ t: c.t, c: c.c })),
        cacheStatus,
      };
    },
  };
}
