import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import {
  getHeadlinesController,
  explainNewsController,
  generateNewsQuizController,
} from './iaNoticiasEducativas.controller';

const router = Router();

router.use(requireAuth);
router.get('/headlines', getHeadlinesController);
router.post('/explain', explainNewsController);
router.post('/quiz', generateNewsQuizController);

export default router;
