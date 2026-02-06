/**
 * Tipos para la feature Profile
 */

export interface ProfileUser {
  id: string;
  name: string;
  username?: string;
  joinedAt?: string;
}

export interface ProfileStats {
  bf: number;
  following: number;
  followers: number;
}

export default {};
