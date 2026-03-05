import type { Request, Response } from 'express';
import type { CandleRange, CandleTimeframe } from '../domain/market.types';
import {
  getCandlesByTimeframeUseCase,
  getMarketOverviewUseCase,
  priceCacheService,
  searchMarketUseCase,
} from '../config/market.wiring';

const MIN_QUERY_LENGTH = 1;
const MAX_QUERY_LENGTH = 50;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export const searchMarketController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < MIN_QUERY_LENGTH) {
      res.status(400).json({
        message: `Query "q" is required and must be at least ${MIN_QUERY_LENGTH} character(s).`,
      });
      return;
    }
    if (q.length > MAX_QUERY_LENGTH) {
      res.status(400).json({
        message: `Query "q" must be at most ${MAX_QUERY_LENGTH} characters.`,
      });
      return;
    }

    let limit: number | undefined;
    if (req.query.limit !== undefined && req.query.limit !== '') {
      limit = Number(req.query.limit);
      if (Number.isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
        res.status(400).json({
          message: `"limit" must be between 1 and ${MAX_LIMIT}.`,
        });
        return;
      }
    }

    const result = await searchMarketUseCase.execute(q, limit ?? DEFAULT_LIMIT);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Market search failed';
    const isBadGateway =
      message.includes('timeout') ||
      message.includes('Yahoo') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT');

    if (isBadGateway) {
      console.error('[market] Search upstream error:', err);
      res
        .status(502)
        .json({ message: 'Search service temporarily unavailable.' });
      return;
    }

    console.error('[market] Search error:', err);
    res.status(500).json({ message: 'An error occurred while searching.' });
  }
};

const VALID_TIMEFRAMES: CandleTimeframe[] = ['1h', '6h', '1d', '1mo'];
const VALID_RANGES: CandleRange[] = ['1wk', '1mo', '3mo', '6mo', '1y'];

/**
 * GET /api/market/candles?symbol=XXX&timeframe=1h|6h|1d|1mo&range=1wk|1mo|3mo|6mo|1y
 * range es opcional; si no se envía se usa el rango por defecto del timeframe.
 */
export const getCandlesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const symbol =
      typeof req.query.symbol === 'string' ? req.query.symbol.trim() : '';
    if (!symbol) {
      res.status(400).json({ message: 'Query "symbol" is required.' });
      return;
    }

    const timeframeParam =
      typeof req.query.timeframe === 'string'
        ? req.query.timeframe.trim().toLowerCase()
        : '';
    if (
      !timeframeParam ||
      !VALID_TIMEFRAMES.includes(timeframeParam as CandleTimeframe)
    ) {
      res.status(400).json({
        message: `Query "timeframe" is required and must be one of: ${VALID_TIMEFRAMES.join(', ')}.`,
      });
      return;
    }

    const timeframe = timeframeParam as CandleTimeframe;
    const rangeParam =
      typeof req.query.range === 'string'
        ? req.query.range.trim().toLowerCase()
        : undefined;
    const range: CandleRange | undefined =
      rangeParam != null && VALID_RANGES.includes(rangeParam as CandleRange)
        ? (rangeParam as CandleRange)
        : undefined;

    const strategy =
      (req.query.strategy as 'cache-first' | 'swr' | 'network-first') ?? 'swr';
    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;
    const effectiveRange: CandleRange =
      range ??
      (timeframe === '1mo'
        ? '5y'
        : timeframe === '1d'
          ? '6mo'
          : timeframe === '1h'
            ? '1mo'
            : '3mo');
    const { data: result, cacheStatus } = await priceCacheService.getHistorical(
      symbol,
      timeframe,
      effectiveRange,
      strategy,
      requestId,
    );

    const cacheEmoji =
      cacheStatus === 'HIT_L1' || cacheStatus === 'HIT_L2' ? '📦' : '🌐';
    console.log(
      `[market] ${cacheEmoji} Candles ${cacheStatus === 'HIT_L1' || cacheStatus === 'HIT_L2' ? 'CACHÉ (sin API)' : 'API'} symbol=${symbol} timeframe=${timeframe} status=${cacheStatus}`,
    );
    res.status(200).json({ ...result, cacheStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Candles failed';
    const isBadRequest =
      message.includes('required') ||
      message.includes('at most') ||
      message.includes('characters') ||
      message.includes('timeframe');
    const isBadGateway =
      message.includes('timeout') ||
      message.includes('Yahoo') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT');

    if (isBadRequest) {
      res.status(400).json({ message });
      return;
    }
    if (isBadGateway) {
      console.error('[market] Candles upstream error:', err);
      res
        .status(502)
        .json({ message: 'Candles service temporarily unavailable.' });
      return;
    }

    console.error('[market] Candles error:', err);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching candles.' });
  }
};

export const getQuotesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const raw =
      typeof req.query.symbols === 'string' ? req.query.symbols.trim() : '';
    const symbols = raw
      ? raw
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];
    if (symbols.length === 0) {
      res.status(200).json({ quotes: [] });
      return;
    }
    const strategy =
      (req.query.strategy as 'cache-first' | 'swr' | 'network-first') ?? 'swr';
    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;
    const { quotes } = await priceCacheService.getQuotes(
      symbols,
      strategy,
      requestId,
    );
    res.status(200).json({ quotes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quotes failed';
    const isBadGateway =
      message.includes('timeout') ||
      message.includes('Yahoo') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT');
    if (isBadGateway) {
      console.error('[market] Quotes upstream error:', err);
      res
        .status(502)
        .json({ message: 'Quotes service temporarily unavailable.' });
      return;
    }
    console.error('[market] Quotes error:', err);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching quotes.' });
  }
};

export const getOverviewController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const symbol =
      typeof req.query.symbol === 'string' ? req.query.symbol.trim() : '';
    if (!symbol) {
      res.status(400).json({ message: 'Query "symbol" is required.' });
      return;
    }

    const overview = await getMarketOverviewUseCase.execute({ symbol });
    res.status(200).json(overview);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Overview failed';
    const isBadRequest =
      message.includes('required') ||
      message.includes('at most') ||
      message.includes('characters') ||
      message.includes('invalid');
    const isBadGateway =
      message.includes('timeout') ||
      message.includes('Yahoo') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT');

    if (isBadRequest) {
      res.status(400).json({ message });
      return;
    }
    if (isBadGateway) {
      console.error('[market] Overview upstream error:', err);
      res
        .status(502)
        .json({ message: 'Overview service temporarily unavailable.' });
      return;
    }

    console.error('[market] Overview error:', err);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching overview.' });
  }
};

/** GET /api/market/cache/stats - estadísticas de caché (hits L1/L2, misses, inflight, size L1). */
export const getCacheStatsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const stats = priceCacheService.getStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error('[market] Cache stats error:', err);
    res
      .status(500)
      .json({ message: 'Error al obtener estadísticas de caché.' });
  }
};

/** POST /api/market/cache/warmup - calienta HOT_SYMBOLS (network-first). */
export const postCacheWarmupController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const requestId =
      typeof req.headers['x-request-id'] === 'string'
        ? req.headers['x-request-id']
        : undefined;
    const { warmed, errors } =
      await priceCacheService.warmupHotSymbols(requestId);
    res.status(200).json({ warmed, errors });
  } catch (err) {
    console.error('[market] Cache warmup error:', err);
    res.status(500).json({ message: 'Error al ejecutar warmup.' });
  }
};
