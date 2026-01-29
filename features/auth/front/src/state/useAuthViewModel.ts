import * as React from 'react';

import { authClient } from '../api/authClient';
import { useAuthSession } from './AuthContext';

export function useAuthViewModel() {
  const { signIn } = useAuthSession();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
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

  const handleRegister = React.useCallback(async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError('Nombre, email y contraseña son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.register({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      // UX: auto-login. El backend de register devuelve datos públicos,
      // así que llamamos a login para obtener token.
      const loginResult = await authClient.login({
        email: cleanEmail,
        password,
      });

      await signIn(loginResult.token, loginResult.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [confirmPassword, email, name, password, signIn]);

  return {
    name,
    email,
    password,
    confirmPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    isLoading,
    error,
    handleLogin,
    handleRegister,
  };
}

export default useAuthViewModel;
