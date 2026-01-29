import bcrypt from 'bcryptjs';

import type { PasswordService } from '../../domain/ports';

export class BcryptHasher implements PasswordService {
  private readonly rounds: number;

  constructor(rounds?: number) {
    const fromEnv = Number(process.env.AUTH_BCRYPT_ROUNDS);
    this.rounds =
      rounds ?? (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 12);
  }

  async hash(text: string): Promise<string> {
    return bcrypt.hash(text, this.rounds);
  }

  async compare(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }
}

export default BcryptHasher;
