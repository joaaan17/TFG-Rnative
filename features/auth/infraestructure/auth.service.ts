/**
 * Servicio para la feature Auth
 * Maneja la lÃ³gica de datos (API, storage, etc.)
 */

import type { LoginState, LoginCredentials } from '../domain/auth.types';

export const authService = {
  // MÃ©todo para login (a implementar con API real)
  login: async (credentials: LoginCredentials): Promise<void> => {
    // TODO: Implementar llamada a API
    // const response = await apiClient.post('/auth/login', credentials);
    // return response.data;

    // SimulaciÃ³n temporal
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (credentials.email === 'error@example.com') {
      throw new Error('Credenciales invÃ¡lidas');
    }
  },

  // Estado inicial
  getInitialState: (): LoginState => ({
    email: '',
    password: '',
    loading: false,
    error: null,
  }),
};

export default authService;
