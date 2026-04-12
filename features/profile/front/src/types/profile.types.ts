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
  /** Preguntas al consultorio disponibles hoy (máx. 2 por día). */
  consultorioRemainingToday?: number;
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
