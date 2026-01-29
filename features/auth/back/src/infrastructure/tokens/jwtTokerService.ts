import jwt from 'jsonwebtoken';
import type { TokenService } from '../../domain/ports';

export class JwtTokenService implements TokenService {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret = secret ?? process.env.AUTH_JWT_SECRET ?? 'dev-secret';
  }

  sign(payload: Record<string, unknown>): string {
    // Aquí la magia: 'expiresIn' gestiona la caducidad automáticamente.
    // Puedes poner '1h', '7d', etc.
    return jwt.sign(payload, this.secret, { expiresIn: '1d' });
  }

  verify<TPayload extends Record<string, unknown> = Record<string, unknown>>(
    token: string,
  ): TPayload | null {
    try {
      return jwt.verify(token, this.secret) as TPayload;
    } catch {
      return null;
    }
  }
}

export default JwtTokenService;
