import { Platform } from 'react-native';
import type { LoginBody, LoginResponse } from '../types/auth.types';

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

export const authClient = { login };
