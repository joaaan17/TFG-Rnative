/**
 * Tipos para la feature Auth
 */
export interface LoginBody {
  email: string;
  password: string;
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export default {};
