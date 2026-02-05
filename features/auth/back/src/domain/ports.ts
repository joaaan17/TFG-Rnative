import type { NewUser, User } from './auth.types';

// Contrato para la base de datos
export interface AuthRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: NewUser): Promise<User>;
  verifyCode(email: string, code: string): Promise<User | null>;
  verifyCodeOnly(email: string, code: string): Promise<boolean>;
  updateVerificationCode(email: string, code: string): Promise<void>;
  updatePassword(email: string, passwordHash: string): Promise<User | null>;
}

// Contrato para encriptar contraseñas
export interface PasswordService {
  compare(plain: string, hashed: string): Promise<boolean>;
  hash(plain: string): Promise<string>;
}

// Contrato para generar JWTs
export interface TokenService {
  sign(payload: Record<string, unknown>): string;
  verify<TPayload extends Record<string, unknown> = Record<string, unknown>>(
    token: string,
  ): TPayload | null;
}

export interface MailService {
  sendVerificationCode(email: string, code: string): Promise<void>;
}
