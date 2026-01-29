import type { AuthRepository } from '../../../domain/ports';
import type { User } from '../../../domain/auth.types';
import { UserModel } from './user.model';

/**
 * Adaptador Mongo (Mongoose) -> Puerto AuthRepository.
 *
 * Regla importante: mapear `_id` (ObjectId) a `id` (string) antes de devolver al dominio.
 */
export class MongoAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      name: doc.name,
    };
  }

  async save(user: User): Promise<void> {
    // Si viene con id, intentamos actualizar; si no, creamos.
    if (user.id) {
      await UserModel.findByIdAndUpdate(
        user.id,
        {
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash,
          name: user.name,
        },
        { upsert: true, setDefaultsOnInsert: true },
      ).exec();
      return;
    }

    await UserModel.create({
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      name: user.name,
    });
  }
}

export default MongoAuthRepository;
