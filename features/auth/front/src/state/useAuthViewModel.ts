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
      // No hacemos auto-login aquí, el RegisterScreen mostrará el modal de verificación
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [confirmPassword, email, name, password]);

  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [isSendingResetCode, setIsSendingResetCode] = React.useState(false);
  const [forgotPasswordError, setForgotPasswordError] = React.useState<
    string | null
  >(null);

  const handleSendResetCode = React.useCallback(async () => {
    const cleanEmail = forgotPasswordEmail.trim();

    if (!cleanEmail) {
      setForgotPasswordError('El email es obligatorio');
      return;
    }

    setIsSendingResetCode(true);
    setForgotPasswordError(null);

    try {
      // Usar el endpoint específico para recuperación de contraseña
      await authClient.sendPasswordResetCode(cleanEmail);
      setForgotPasswordError(null);
    } catch (err) {
      setForgotPasswordError(
        err instanceof Error ? err.message : 'Error al enviar código',
      );
      throw err; // Re-lanzar para que LoginScreen pueda manejar el flujo
    } finally {
      setIsSendingResetCode(false);
    }
  }, [forgotPasswordEmail]);

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
    // Forgot password
    forgotPasswordEmail,
    setForgotPasswordEmail,
    isSendingResetCode,
    forgotPasswordError,
    handleSendResetCode,
  };
}

export default useAuthViewModel;
