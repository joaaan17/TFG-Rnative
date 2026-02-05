import type { AuthRepository } from '../../../domain/ports';
import type { NewUser, User } from '../../../domain/auth.types';
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
      isVerified: doc.isVerified,
      verificationCode: doc.verificationCode ?? null,
    };
  }

  async save(user: NewUser): Promise<User> {
    // En Mongo, el `_id` lo genera la base de datos.
    const created = await UserModel.create({
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      name: user.name,
      isVerified: user.isVerified,
      verificationCode: user.verificationCode ?? null,
    });

    return {
      id: created._id.toString(),
      email: created.email,
      passwordHash: created.passwordHash,
      name: created.name,
      isVerified: created.isVerified,
      verificationCode: created.verificationCode ?? null,
    };
  }

  async verifyCode(email: string, code: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      email: email.toLowerCase(),
      verificationCode: code,
    }).exec();

    if (!doc) return null;

    // Marcar como verificado y limpiar el código
    doc.isVerified = true;
    doc.verificationCode = null;
    await doc.save();

    return {
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      name: doc.name,
      isVerified: doc.isVerified,
      verificationCode: null,
    };
  }

  async updateVerificationCode(email: string, code: string): Promise<void> {
    await UserModel.updateOne(
      { email: email.toLowerCase() },
      { verificationCode: code },
    ).exec();
  }
}

export default MongoAuthRepository;
