import { Platform } from 'react-native';
import type {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from '../types/auth.types';

function getBaseUrl() {
  // Android emulator: 10.0.2.2 apunta al host (tu PC).
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/auth';

  // iOS simulator / web en local.
  if (Platform.OS === 'ios' || Platform.OS === 'web')
    return 'http://localhost:3000/api/auth';

  // Dispositivo físico: normalmente necesitarás tu IP LAN.
  // Cambia esto por tu IP (ej. http://192.168.1.50:3000/api/auth)
  // o pásalo por config/env si lo prefieres.
  return 'http://localhost:3000/api/auth';
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function login(credentials: LoginBody): Promise<LoginResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Error al iniciar sesión';
    throw new Error(message);
  }

  return data as LoginResponse;
}

export async function register(data: RegisterBody): Promise<RegisterResponse> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string' ? json.message : 'Error al registrarse';
    throw new Error(message);
  }

  return json as RegisterResponse;
}

export async function verifyCode(
  email: string,
  code: string,
): Promise<{ token: string; user: LoginResponse['user'] }> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Código inválido o expirado';
    throw new Error(message);
  }

  return json as { token: string; user: LoginResponse['user'] };
}

export async function resendCode(email: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Error al reenviar código';
    throw new Error(message);
  }
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Error al resetear contraseña';
    throw new Error(message);
  }

  return json as { message: string };
}

export async function sendPasswordResetCode(
  email: string,
): Promise<{ message: string }> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/send-password-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Error al enviar código de recuperación';
    throw new Error(message);
  }

  return json as { message: string };
}

export async function verifyPasswordResetCode(
  email: string,
  code: string,
): Promise<{ message: string }> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/verify-password-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Código de verificación incorrecto';
    throw new Error(message);
  }

  return json as { message: string };
}

export const authClient = {
  login,
  register,
  verifyCode,
  resendCode,
  resetPassword,
  sendPasswordResetCode,
  verifyPasswordResetCode,
};
