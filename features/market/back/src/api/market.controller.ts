import type { Request, Response } from 'express';
import type { CandleInterval, CandleRange } from '../domain/market.types';
import {
  getCandlesUseCase,
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

const VALID_RANGES: CandleRange[] = [
  '1d',
  '5d',
  '1wk',
  '1mo',
  '3mo',
  '6mo',
  '1y',
  '2y',
  '5y',
  'max',
];
const VALID_INTERVALS: CandleInterval[] = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '1d',
  '1wk',
  '1mo',
];
const DEFAULT_RANGE: CandleRange = '1mo';
const DEFAULT_INTERVAL: CandleInterval = '1d';

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

    const rangeParam =
      typeof req.query.range === 'string' ? req.query.range : undefined;
    const range: CandleRange =
      rangeParam != null && VALID_RANGES.includes(rangeParam as CandleRange)
        ? (rangeParam as CandleRange)
        : DEFAULT_RANGE;

    const intervalParam =
      typeof req.query.interval === 'string' ? req.query.interval : undefined;
    const interval: CandleInterval =
      intervalParam != null &&
      VALID_INTERVALS.includes(intervalParam as CandleInterval)
        ? (intervalParam as CandleInterval)
        : DEFAULT_INTERVAL;

    const candles = await getCandlesUseCase.execute({
      symbol,
      range,
      interval,
    });

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      range,
      interval,
      count: candles.length,
      candles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Candles failed';
    const isBadRequest =
      message.includes('required') ||
      message.includes('at most') ||
      message.includes('characters');
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
    res.status(500).json({ message: 'An error occurred while fetching candles.' });
  }
};
