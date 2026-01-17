/**
 * Tipos para la feature Auth
 */

export interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export default {};
