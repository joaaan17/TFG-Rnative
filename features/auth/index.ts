/**
 * Barrel export para la feature Auth
 */

export { LoginScreen } from './ui/LoginScreen';
export { useAuthViewModel } from './aplication/useAuthViewModel';
export { authService } from './infraestructure/auth.service';
export type { LoginState, LoginCredentials } from './domain/auth.types';

export default {};
