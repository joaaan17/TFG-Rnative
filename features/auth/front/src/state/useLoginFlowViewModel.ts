import * as React from 'react';

import { authService } from '../services/authService';
import { useAuthViewModel } from './useAuthViewModel';
import { useResetPasswordViewModel } from './useResetPasswordViewModel';

const VERIFICATION_TIMEOUT = 10 * 60; // 10 minutos en segundos

export type PasswordResetStep = 'forgot' | 'verify' | 'reset';

export function useLoginFlowViewModel() {
  const authVm = useAuthViewModel();

  // Estado del flujo de recuperación de contraseña
  const [step, setStep] = React.useState<PasswordResetStep | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [verifiedCode, setVerifiedCode] = React.useState('');
  const [code, setCode] = React.useState('');
  const [timeRemaining, setTimeRemaining] =
    React.useState(VERIFICATION_TIMEOUT);
  const [isSendingResetCode, setIsSendingResetCode] = React.useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(false);
  const [isResendingCode, setIsResendingCode] = React.useState(false);
  const [resetFlowError, setResetFlowError] = React.useState<string | null>(
    null,
  );

  const resetPasswordVm = useResetPasswordViewModel(
    forgotPasswordEmail,
    verifiedCode,
  );

  // Temporizador para reenviar código.
  // timeRemaining solo se reinicia en sendResetCode y resendCode (acciones explícitas),
  // nunca por re-render accidental.
  React.useEffect(() => {
    if (step !== 'verify' || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeRemaining]);

  const closeAll = React.useCallback(() => {
    setStep(null);
    setForgotPasswordEmail('');
    setVerifiedCode('');
    setCode('');
    setResetFlowError(null);
    setTimeRemaining(VERIFICATION_TIMEOUT);
  }, []);

  const openForgotPassword = React.useCallback((prefillEmail?: string) => {
    if (prefillEmail) setForgotPasswordEmail(prefillEmail);
    setStep('forgot');
    setResetFlowError(null);
  }, []);

  const closeForgotPassword = React.useCallback(() => {
    setStep(null);
    setForgotPasswordEmail('');
    setResetFlowError(null);
  }, []);

  const sendResetCode = React.useCallback(async () => {
    setIsSendingResetCode(true);
    setResetFlowError(null);
    try {
      await authService.sendPasswordResetCode(forgotPasswordEmail);
      setStep('verify');
      setCode('');
      setTimeRemaining(VERIFICATION_TIMEOUT);
    } catch (err) {
      const msg = authService.extractErrorMessage(
        err,
        'Error al enviar código',
      );
      setResetFlowError(msg);
      throw err;
    } finally {
      setIsSendingResetCode(false);
    }
  }, [forgotPasswordEmail]);

  const verifyCode = React.useCallback(async () => {
    setIsVerifyingCode(true);
    setResetFlowError(null);
    try {
      await authService.verifyPasswordResetCode(forgotPasswordEmail, code);
      setVerifiedCode(code.trim());
      setStep('reset');
    } catch (err) {
      const msg = authService.extractErrorMessage(
        err,
        'Código inválido o expirado',
      );
      setResetFlowError(msg);
      throw err;
    } finally {
      setIsVerifyingCode(false);
    }
  }, [code, forgotPasswordEmail]);

  const resendCode = React.useCallback(async () => {
    if (timeRemaining > 0) {
      setResetFlowError('Espera antes de reenviar el código');
      return;
    }
    setIsResendingCode(true);
    setResetFlowError(null);
    try {
      await authService.sendPasswordResetCode(forgotPasswordEmail);
      setCode('');
      setTimeRemaining(VERIFICATION_TIMEOUT);
    } catch (err) {
      setResetFlowError(
        authService.extractErrorMessage(err, 'Error al reenviar'),
      );
    } finally {
      setIsResendingCode(false);
    }
  }, [forgotPasswordEmail, timeRemaining]);

  const resetPassword = React.useCallback(async () => {
    try {
      await resetPasswordVm.handleResetPassword();
      closeAll();
    } catch {
      // Error ya gestionado en resetPasswordVm.error
    }
  }, [resetPasswordVm, closeAll]);

  const closeVerifyModal = React.useCallback(() => {
    closeAll();
  }, [closeAll]);

  const closeResetModal = React.useCallback(() => {
    closeAll();
  }, [closeAll]);

  return {
    // Login (delegado a useAuthViewModel)
    ...authVm,

    // Forgot password flow
    showForgotPasswordModal: step === 'forgot',
    showVerificationModal: step === 'verify',
    showResetPasswordModal: step === 'reset',
    forgotPasswordEmail,
    setForgotPasswordEmail,
    openForgotPassword,
    closeForgotPassword,
    sendResetCode,
    verifyCode,
    resendCode,
    resetPassword,
    closeAll,
    closeVerifyModal,
    closeResetModal,

    // Verification modal state
    verificationCode: code,
    setVerificationCode: setCode,
    verificationTimeRemaining: timeRemaining,
    isSendingResetCode,
    isVerifyingCode,
    isResendingCode,
    resetFlowError,

    // Reset password modal
    verifiedCode,
    resetPasswordVm,
  };
}

export default useLoginFlowViewModel;
