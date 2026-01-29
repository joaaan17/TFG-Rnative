import * as React from 'react';

import { authClient } from '../api/authClient';
import { useAuthSession } from './AuthContext';

export function useAuthViewModel() {
  const { signIn } = useAuthSession();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = React.useCallback(async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.login({
        email: cleanEmail,
        password,
      });
      await signIn(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, signIn]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
}

export default useAuthViewModel;
