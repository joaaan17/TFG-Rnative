import { Router } from 'express';
import { requireAuth } from '../../../../auth/back/src/api/auth.middleware';
import { askAiController } from './iapreguntas.controller';

const router = Router();

router.use(requireAuth);
router.post('/ask', askAiController);

export default router;
