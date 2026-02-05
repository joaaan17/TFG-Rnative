import * as React from 'react';
import { authClient } from '../api/authClient';

export function useResetPasswordViewModel(email: string, code: string) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleResetPassword = React.useCallback(async () => {
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanPassword || !cleanConfirmPassword) {
      setError('Las contraseñas son obligatorias');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.resetPassword(email, code, cleanPassword);
      // Éxito - el componente padre manejará la redirección
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cambiar la contraseña',
      );
      throw err; // Re-lanzar para que el componente padre pueda manejar el flujo
    } finally {
      setIsLoading(false);
    }
  }, [email, code, password, confirmPassword]);

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    error,
    handleResetPassword,
  };
}

export default useResetPasswordViewModel;
