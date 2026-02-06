import { relationshipsClient } from '../api/relationshipsClient';

export interface PendingRequestItem {
  userId: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

export const relationshipsService = {
  async requestFriendship(
    targetUserId: string,
    token: string,
  ): Promise<{ id: string; status: string }> {
    const trimmed = targetUserId?.trim();
    if (!trimmed) throw new Error('ID de usuario requerido');
    if (!token?.trim()) throw new Error('Token requerido');
    return relationshipsClient.requestFriendship(trimmed, token);
  },

  async getPendingRequests(
    token: string,
  ): Promise<{ items: PendingRequestItem[] }> {
    if (!token?.trim()) throw new Error('Token requerido');
    return relationshipsClient.getPendingRequests(token);
  },

  async acceptFriendship(
    fromUserId: string,
    token: string,
  ): Promise<{ id: string; status: string }> {
    const trimmed = fromUserId?.trim();
    if (!trimmed) throw new Error('ID de usuario requerido');
    if (!token?.trim()) throw new Error('Token requerido');
    return relationshipsClient.acceptFriendship(trimmed, token);
  },

  async rejectFriendship(fromUserId: string, token: string): Promise<void> {
    const trimmed = fromUserId?.trim();
    if (!trimmed) throw new Error('ID de usuario requerido');
    if (!token?.trim()) throw new Error('Token requerido');
    return relationshipsClient.rejectFriendship(trimmed, token);
  },
};
