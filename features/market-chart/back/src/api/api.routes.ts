import { Router } from 'express';
import { getMarketChartController } from './market-chart.controller';

const router = Router();

router.get('/chart', getMarketChartController);

export default router;
