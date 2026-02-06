import * as React from 'react';

import { authService } from '../services/authService';
import { useAuthSession } from './AuthContext';

export function useAuthViewModel() {
  const { signIn } = useAuthSession();

  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      await signIn(result.token, result.user);
    } catch (err) {
      setError(authService.extractErrorMessage(err, 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [email, password, signIn]);

  const handleRegister = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(
        name,
        username,
        email,
        password,
        confirmPassword,
      );
      // RegisterScreen mostrará el modal de verificación
    } catch (err) {
      setError(authService.extractErrorMessage(err, 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [confirmPassword, email, name, password, username]);

  return {
    name,
    username,
    email,
    password,
    confirmPassword,
    setName,
    setUsername,
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
