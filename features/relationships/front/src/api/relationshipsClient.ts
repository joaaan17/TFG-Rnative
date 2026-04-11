import { Platform } from 'react-native';
import { env } from '@/config/env';

function getBaseUrl() {
  const base =
    env.apiUrl && env.apiUrl !== 'https://api.example.com'
      ? env.apiUrl.replace(/\/$/, '')
      : Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
  return `${base}/api/relationships`;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const relationshipsClient = {
  async requestFriendship(
    targetUserId: string,
    token: string,
  ): Promise<{ id: string; status: string }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });
    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const msg =
        typeof (data as { error?: string })?.error === 'string'
          ? (data as { error: string }).error
          : 'Error al enviar solicitud';
      throw new Error(msg);
    }
    return data as { id: string; status: string };
  },

  async getPendingRequests(token: string): Promise<{
    items: {
      userId: string;
      name: string;
      username?: string;
      avatarUrl?: string;
    }[];
  }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/pending-requests`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await parseJsonSafe(response);
    const data = raw?.data ?? raw;
    if (!response.ok) {
      const msg =
        typeof (data as { error?: string })?.error === 'string'
          ? (data as { error: string }).error
          : 'Error al cargar solicitudes';
      throw new Error(msg);
    }
    return (data ?? { items: [] }) as {
      items: {
        userId: string;
        name: string;
        username?: string;
        avatarUrl?: string;
      }[];
    };
  },

  async acceptFriendship(
    fromUserId: string,
    token: string,
  ): Promise<{ id: string; status: string }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fromUserId }),
    });
    const raw = await parseJsonSafe(response);
    const data = raw?.data ?? raw;
    if (!response.ok) {
      const msg =
        typeof (raw as { error?: string })?.error === 'string'
          ? (raw as { error: string }).error
          : 'Error al aceptar';
      throw new Error(msg);
    }
    return data as { id: string; status: string };
  },

  async getFriends(
    token: string,
    search = '',
    page = 1,
    limit = 20,
  ): Promise<{
    items: {
      userId: string;
      name: string;
      username?: string;
      avatarUrl?: string;
    }[];
    page: number;
    limit: number;
  }> {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search.trim()) params.set('search', search.trim().slice(0, 50));
    const response = await fetch(`${baseUrl}/friends?${params}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await parseJsonSafe(response);
    const data = raw?.data ?? raw;
    if (!response.ok) {
      const msg =
        typeof (raw as { error?: string })?.error === 'string'
          ? (raw as { error: string }).error
          : 'Error al cargar amigos';
      throw new Error(msg);
    }
    return (data ?? { items: [], page: 1, limit: 20 }) as {
      items: {
        userId: string;
        name: string;
        username?: string;
        avatarUrl?: string;
      }[];
      page: number;
      limit: number;
    };
  },

  async rejectFriendship(fromUserId: string, token: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fromUserId }),
    });
    const raw = await parseJsonSafe(response);
    if (!response.ok) {
      const msg =
        typeof (raw as { error?: string })?.error === 'string'
          ? (raw as { error: string }).error
          : 'Error al rechazar';
      throw new Error(msg);
    }
  },
};
