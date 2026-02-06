import * as React from 'react';

import { authService } from '../services/authService';

export function useResetPasswordViewModel(email: string, code: string) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleResetPassword = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email, code, password, confirmPassword);
    } catch (err) {
      const msg = authService.extractErrorMessage(
        err,
        'Error al cambiar la contraseña',
      );
      setError(msg);
      throw err;
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
