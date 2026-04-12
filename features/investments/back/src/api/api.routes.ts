import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  getPortfolioController,
  getPortfolioOverviewController,
  getDashboardSummaryController,
  getPerformanceController,
  getCashOverviewController,
  postBuyOrderController,
  postSellOrderController,
  getTransactionsController,
} from './investments.controller';

const router = Router();

router.get('/portfolio/me', requireAuth, getPortfolioController);
router.get('/portfolio/overview', requireAuth, getPortfolioOverviewController);
/** Resumen dashboard; opcional ?userId= para ver cartera de otro usuario (amigo). */
router.get('/portfolio/summary', requireAuth, getDashboardSummaryController);
router.get('/portfolio/performance', requireAuth, getPerformanceController);
router.get('/cash/overview', requireAuth, getCashOverviewController);
router.post('/orders/buy', requireAuth, postBuyOrderController);
router.post('/orders/sell', requireAuth, postSellOrderController);
router.get('/transactions/me', requireAuth, getTransactionsController);

export default router;
