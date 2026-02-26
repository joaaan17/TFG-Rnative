import type { Request, Response } from 'express';
import { Router } from 'express';
import {
  getCandlesController,
  getOverviewController,
  getQuotesController,
  searchMarketController,
} from './market.controller';

const router = Router();

/** Comprueba que el router market está montado (GET /api/market) */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    routes: ['/search', '/candles', '/quotes', '/overview'],
  });
});

router.get('/search', searchMarketController);
router.get('/candles', getCandlesController);
router.get('/quotes', getQuotesController);
router.get('/overview', getOverviewController);

export default router;
