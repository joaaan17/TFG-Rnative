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
