import * as React from 'react';

import { authClient } from '../api/authClient';
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

  // Temporizador
  React.useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleVerify = React.useCallback(async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.verifyCode(email, code);
      
      // Si es modo registro, hacer login automáticamente
      if (mode === 'register') {
        await signIn(result.token, result.user);
      }
      // Si es modo reset-password, solo verificar el código (no hacer login)
      // El componente padre manejará el siguiente paso
      
      return result; // Devolver el resultado para que el componente padre pueda usarlo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
      throw err; // Re-lanzar para que el componente padre pueda manejar el error
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
      await authClient.resendCode(email);
      setTimeRemaining(VERIFICATION_TIMEOUT); // Reiniciar temporizador
      setCode(''); // Limpiar código anterior
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar');
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
