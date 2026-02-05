import { Router } from 'express';
import {
  loginController,
  registerController,
  verifyController,
  resendCodeController,
  resetPasswordController,
  sendPasswordResetCodeController,
  verifyPasswordResetCodeController,
} from './auth.controller';

const router = Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/verify', verifyController);
router.post('/resend-code', resendCodeController);
router.post('/reset-password', resetPasswordController);
router.post('/send-password-reset-code', sendPasswordResetCodeController);
router.post(
  '/verify-password-reset-code',
  verifyPasswordResetCodeController,
);

export default router;
