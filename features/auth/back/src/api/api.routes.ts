import { RequestHandler, Router } from 'express';
import { loginController } from './auth.controller';

const router = Router();

router.post('/login', loginController as RequestHandler);

export default router;
