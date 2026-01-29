import type { AuthRepository } from '../../domain/ports';
import type { User } from '../../domain/auth.types';

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

  async save(user: User): Promise<void> {
    InMemoryAuthRepository.usersByEmail.set(user.email, user);
  }
}

export default InMemoryAuthRepository;
