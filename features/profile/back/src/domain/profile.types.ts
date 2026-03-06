export interface Profile {
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
  /** Efectivo disponible (sincronizado desde la cartera de inversiones). */
  cashBalance?: number;
  /** Experiencia acumulada (XP) por bonos: compra, venta, test, noticia. */
  experience?: number;
}
