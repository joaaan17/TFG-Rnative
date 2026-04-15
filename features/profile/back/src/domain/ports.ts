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
  /**
   * Marca actividad del día civil (Europe/Madrid) para la racha, sin otorgar XP.
   * Idempotente el mismo día. Debe llamarse cuando el usuario autenticado abre la app / perfil.
   */
  recordDailyStreakActivity(userId: string): Promise<void>;
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
  /**
   * Reserva una pregunta al consultorio en la ventana actual de 6 h (Europe/Madrid, máx. 2).
   * Debe llamarse antes de invocar a la IA; si falla la IA, usar releaseConsultorioQuestion.
   */
  reserveConsultorioQuestion(
    userId: string,
  ): Promise<{ ok: boolean; remainingAfter: number }>;
  /** Deshace una reserva si la respuesta de la IA falló. */
  releaseConsultorioQuestion(userId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  /** XP y niveles-hito cuya recompensa en $ ya se abonó (persistente). */
  getExperienceAndAchievementGrants(
    userId: string,
  ): Promise<{ experience: number; grantedLevels: number[] } | null>;
  setAchievementCashGrantedLevels(
    userId: string,
    levels: number[],
  ): Promise<void>;
  searchProfiles(
    q: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<ProfileSearchResult[]>;
  /** Usuarios registrados excluyendo los ids dados (amigos, pendientes, yo). Paginado opcional. */
  suggestProfiles(
    excludeUserIds: string[],
    limit: number,
    page?: number,
  ): Promise<ProfileSearchResult[]>;
}

export interface FriendCountProvider {
  getFriendCount(userId: string): Promise<number>;
}
