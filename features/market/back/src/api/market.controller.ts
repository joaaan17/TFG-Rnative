import type { Request, Response } from 'express';
import { searchMarketUseCase } from '../config/market.wiring';

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
