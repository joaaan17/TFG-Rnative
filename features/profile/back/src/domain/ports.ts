import type { Profile } from './profile.types';

export interface ProfileSearchResult {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

/** Obtiene el efectivo disponible del usuario desde la cartera de inversiones. */
export interface CashBalanceProvider {
  getCashBalance(userId: string): Promise<number>;
}

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
  updateCashBalance(userId: string, cashBalance: number): Promise<void>;
  addExperience(userId: string, amount: number): Promise<number>;
  /**
   * Añade XP solo si el usuario no ha reclamado antes esta noticia (idempotente).
   * @returns { awarded: true, newTotal } si se otorgó; { awarded: false, newTotal } si ya estaba reclamada.
   */
  addExperienceIfNewsNotClaimed(
    userId: string,
    newsId: string,
    amount: number,
  ): Promise<{ awarded: boolean; newTotal: number }>;
  deleteById(id: string): Promise<void>;
  searchProfiles(
    q: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<ProfileSearchResult[]>;
}

export interface FriendCountProvider {
  getFriendCount(userId: string): Promise<number>;
}
