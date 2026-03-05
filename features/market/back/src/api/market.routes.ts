import type { Request, Response } from 'express';
import { Router } from 'express';
import {
  getCandlesController,
  getCacheStatsController,
  getOverviewController,
  getQuotesController,
  postCacheWarmupController,
  searchMarketController,
} from './market.controller';

const router = Router();

/** Comprueba que el router market está montado (GET /api/market) */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    routes: [
      '/search',
      '/candles',
      '/quotes',
      '/overview',
      '/cache/stats',
      '/cache/warmup',
    ],
  });
});

router.get('/search', searchMarketController);
router.get('/candles', getCandlesController);
router.get('/quotes', getQuotesController);
router.get('/overview', getOverviewController);
router.get('/cache/stats', getCacheStatsController);
router.post('/cache/warmup', postCacheWarmupController);

export default router;
