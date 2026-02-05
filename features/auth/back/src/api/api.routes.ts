import { Router } from 'express';
import {
  loginController,
  registerController,
  verifyController,
  resendCodeController,
} from './auth.controller';

const router = Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/verify', verifyController);
router.post('/resend-code', resendCodeController);

export default router;
