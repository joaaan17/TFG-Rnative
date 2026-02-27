import type { GetHistoricalHourlyPort } from '../../domain/ports';

/**
 * Adaptador que usa el caché global de market (PriceCacheService) para histórico horario.
 * interval = 1h, range = 5d (para vista 1D).
 */
export function createHistoricalHourlyAdapter(
  getHistorical: (
    symbol: string,
    interval: string,
    range: string,
    strategy?: 'swr' | 'cache-first' | 'network-first',
    requestId?: string,
  ) => Promise<{ data: { candles: Array<{ t: number; c: number }> }; cacheStatus: string }>,
): GetHistoricalHourlyPort {
  return {
    async getHistoricalHourly(symbol, range, requestId) {
      const { data, cacheStatus } = await getHistorical(
        symbol,
        '1h',
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
