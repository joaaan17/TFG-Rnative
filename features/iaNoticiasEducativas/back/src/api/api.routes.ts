import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import { getHeadlinesController, explainNewsController } from './iaNoticiasEducativas.controller';

const router = Router();

router.use(requireAuth);
router.get('/headlines', getHeadlinesController);
router.post('/explain', explainNewsController);

export default router;
