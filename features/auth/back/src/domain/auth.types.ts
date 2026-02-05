export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  isVerified: boolean;
  verificationCode?: string | null;
}

/**
 * Usuario nuevo (antes de persistir).
 * En Mongo el `_id` lo genera la base de datos, por eso aquí no hay `id`.
 */
export type NewUser = Omit<User, 'id'>;

export interface AuthToken {
  token: string;
  expiresIn: number;
}
