/**
 * Tipos para la feature Auth
 */
export interface LoginBody {
  email: string;
  password: string;
}

/** Alias para LoginBody (credenciales de inicio de sesión) */
export type LoginCredentials = LoginBody;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export type RegisterResponse = AuthUser;

export interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export default {};
