import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  getPortfolioController,
  getPortfolioOverviewController,
  getPerformanceController,
  postBuyOrderController,
  postSellOrderController,
  getTransactionsController,
} from './investments.controller';

const router = Router();

router.get('/portfolio/me', requireAuth, getPortfolioController);
router.get('/portfolio/overview', requireAuth, getPortfolioOverviewController);
router.get('/portfolio/performance', requireAuth, getPerformanceController);
router.post('/orders/buy', requireAuth, postBuyOrderController);
router.post('/orders/sell', requireAuth, postSellOrderController);
router.get('/transactions/me', requireAuth, getTransactionsController);

export default router;
