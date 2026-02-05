import type { AuthRepository } from '../../domain/ports';
import crypto from 'crypto';

import type { NewUser, User } from '../../domain/auth.types';

/**
 * Repository de persistencia.
 *
 * Nota: originalmente este archivo estaba pensado para Mongoose, pero este repo
 * (Expo/React Native) no incluye dependencias de Node como `mongoose`.
 *
 * Para mantener el contrato y evitar errores de TS/ESLint, esta implementación
 * es en memoria. Si más adelante separáis el backend a un paquete Node, podéis
 * sustituirla por una versión real con Mongoose/Postgres/etc.
 */
export class InMemoryAuthRepository implements AuthRepository {
  private static usersByEmail = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return InMemoryAuthRepository.usersByEmail.get(email) ?? null;
  }

  async save(user: NewUser): Promise<User> {
    const saved: User = {
      id: crypto.randomUUID(),
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      name: user.name,
      isVerified: user.isVerified,
      verificationCode: user.verificationCode ?? null,
    };

    InMemoryAuthRepository.usersByEmail.set(saved.email, saved);
    return saved;
  }

  async verifyCode(email: string, code: string): Promise<User | null> {
    const user = InMemoryAuthRepository.usersByEmail.get(email.toLowerCase());
    if (!user || user.verificationCode !== code) return null;

    // Marcar como verificado y limpiar código
    const verified: User = {
      ...user,
      isVerified: true,
      verificationCode: null,
    };
    InMemoryAuthRepository.usersByEmail.set(user.email, verified);
    return verified;
  }

  async updateVerificationCode(email: string, code: string): Promise<void> {
    const user = InMemoryAuthRepository.usersByEmail.get(email.toLowerCase());
    if (!user) return;

    const updated: User = {
      ...user,
      verificationCode: code,
    };
    InMemoryAuthRepository.usersByEmail.set(user.email, updated);
  }

  async verifyCodeOnly(email: string, code: string): Promise<boolean> {
    const user = InMemoryAuthRepository.usersByEmail.get(email.toLowerCase());
    if (!user) return false;
    return user.verificationCode === code;
  }

  async updatePassword(
    email: string,
    passwordHash: string,
  ): Promise<User | null> {
    const user = InMemoryAuthRepository.usersByEmail.get(email.toLowerCase());
    if (!user) return null;

    const updated: User = {
      ...user,
      passwordHash,
    };
    InMemoryAuthRepository.usersByEmail.set(user.email, updated);
    return updated;
  }
}

export default InMemoryAuthRepository;
