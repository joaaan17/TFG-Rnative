/**
 * Tipos para la feature Profile
 */

export interface ProfileUser {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  joinedAt?: string;
  bf?: number;
  nivel?: number;
  division?: string;
  patrimonio?: number;
  following?: number;
  followers?: number;
  /** Efectivo disponible (sincronizado con la cartera de inversiones). */
  cashBalance?: number;
  /** Experiencia acumulada (XP) por bonos: compra, venta, test, noticia. */
  experience?: number;
  /** Preguntas al consultorio en la ventana actual de 6 h (máx. 2, hora España). */
  consultorioRemainingToday?: number;
  /**
   * Solo en la respuesta GET propio: recompensas de logros de nivel abonadas en esta petición.
   */
  lastAchievementGrants?: {
    grants: Array<{ level: number; amountUsd: number }>;
    totalGrantedUsd: number;
  };
}

export interface ProfileStats {
  bf: number;
  following: number;
  followers: number;
}

export interface ProfileSearchItem {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

export default {};
