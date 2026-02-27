import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  getPortfolioController,
  postBuyOrderController,
  postSellOrderController,
  getTransactionsController,
} from './investments.controller';

const router = Router();

router.get('/portfolio/me', requireAuth, getPortfolioController);
router.post('/orders/buy', requireAuth, postBuyOrderController);
router.post('/orders/sell', requireAuth, postSellOrderController);
router.get('/transactions/me', requireAuth, getTransactionsController);

export default router;
