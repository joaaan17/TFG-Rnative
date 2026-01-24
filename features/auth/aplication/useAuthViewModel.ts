/**
 * ViewModel para la feature Auth
 * Maneja el estado y la lÃ³gica de presentaciÃ³n
 */

import { useState } from 'react';
import type { LoginState } from '../domain/auth.types';
import { authService } from '../infraestructure/auth.service';

export function useAuthViewModel() {
  const [state, setState] = useState<LoginState>(authService.getInitialState());

  // Handlers
  const setEmail = (email: string) => {
    setState((prev) => ({ ...prev, email, error: null }));
  };

  const setPassword = (password: string) => {
    setState((prev) => ({ ...prev, password, error: null }));
  };

  const handleLogin = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authService.login({
        email: state.email,
        password: state.password,
      });
      // TODO: Navegar a la siguiente pantalla despuÃ©s del login exitoso
      // router.push('/home');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Error al iniciar sesiÃ³n',
        loading: false,
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    state,
    handlers: {
      setEmail,
      setPassword,
      handleLogin,
    },
  };
}

export default useAuthViewModel;
