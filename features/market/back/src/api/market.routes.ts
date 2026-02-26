import { Router } from 'express';
import { searchMarketController } from './market.controller';

const router = Router();

router.get('/search', searchMarketController);

export default router;
