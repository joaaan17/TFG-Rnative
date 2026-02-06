import * as React from 'react';

import { authService } from '../services/authService';
import { useAuthSession } from './AuthContext';

const VERIFICATION_TIMEOUT = 10 * 60; // 10 minutos en segundos

export type VerificationMode = 'register' | 'reset-password';

export function useVerificationViewModel(
  email: string,
  mode: VerificationMode = 'register',
) {
  const { signIn } = useAuthSession();

  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] =
    React.useState(VERIFICATION_TIMEOUT);

  React.useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleVerify = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verifyCode(email, code);
      if (mode === 'register') {
        await signIn(result.token, result.user);
      }
      return result;
    } catch (err) {
      setError(authService.extractErrorMessage(err, 'Código inválido'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [code, email, signIn, mode]);

  const handleResend = React.useCallback(async () => {
    if (timeRemaining > 0) {
      setError('Espera antes de reenviar el código');
      return;
    }
    setIsResending(true);
    setError(null);
    try {
      await authService.resendCode(email);
      setTimeRemaining(VERIFICATION_TIMEOUT);
      setCode('');
    } catch (err) {
      setError(authService.extractErrorMessage(err, 'Error al reenviar'));
    } finally {
      setIsResending(false);
    }
  }, [email, timeRemaining]);

  return {
    code,
    setCode,
    isLoading,
    isResending,
    error,
    timeRemaining,
    handleVerify,
    handleResend,
  };
}

export default useVerificationViewModel;
