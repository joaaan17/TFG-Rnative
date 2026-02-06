/**
 * authService — Lógica frontend de Auth
 *
 * Única capa que usa authClient (HTTP puro).
 * Centraliza validaciones y criterios de error.
 * Nunca se usa fuera de los ViewModels.
 */

import { authClient } from '../api/authClient';
import type { AuthUser, LoginResponse } from '../types/auth.types';

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      throw new Error('Email y contraseña son obligatorios');
    }
    return authClient.login({ email: cleanEmail, password });
  },

  async register(
    name: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<AuthUser> {
    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanUsername || !cleanEmail || !password || !confirmPassword) {
      throw new Error('Nombre, usuario, email y contraseña son obligatorios');
    }
    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    return authClient.register({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password,
    });
  },

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ token: string; user: LoginResponse['user'] }> {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      throw new Error('El código debe tener 6 dígitos');
    }
    return authClient.verifyCode(email, code);
  },

  async resendCode(email: string): Promise<void> {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('El email es obligatorio');
    }
    return authClient.resendCode(cleanEmail);
  },

  async sendPasswordResetCode(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('El email es obligatorio');
    }
    return authClient.sendPasswordResetCode(cleanEmail);
  },

  async verifyPasswordResetCode(
    email: string,
    code: string,
  ): Promise<{ message: string }> {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      throw new Error('El código debe tener 6 dígitos');
    }
    return authClient.verifyPasswordResetCode(email, code);
  },

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const cleanPassword = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();
    if (!cleanPassword || !cleanConfirm) {
      throw new Error('Las contraseñas son obligatorias');
    }
    if (cleanPassword !== cleanConfirm) {
      throw new Error('Las contraseñas no coinciden');
    }
    if (cleanPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    return authClient.resetPassword(email, code, cleanPassword);
  },

  async deleteAccount(userId: string, token: string): Promise<void> {
    const trimmed = userId?.trim();
    if (!trimmed) {
      throw new Error('ID de usuario requerido');
    }
    if (!token?.trim()) {
      throw new Error('Sesión expirada, inicia sesión de nuevo');
    }
    return authClient.deleteUser(trimmed, token);
  },

  extractErrorMessage,
};
