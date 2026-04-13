import jwt from 'jsonwebtoken';
import type { TokenService } from '../../domain/ports';
import { authEnv } from '../../config/auth.env';

/** Sin expiración en el JWT si cadena vacía, `none`, `never`, `0` o `false`. */
function useJwtExpiry(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s || s === 'none' || s === 'never' || s === 'false' || s === '0') {
    return false;
  }
  return true;
}

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresInRaw: string;

  constructor(secret?: string, expiresInOverride?: string) {
    this.secret =
      secret ?? authEnv.jwtSecret || process.env.AUTH_JWT_SECRET || 'dev-secret';
    this.expiresInRaw = (expiresInOverride ?? authEnv.jwtExpiresIn ?? '').trim();
  }

  sign(payload: Record<string, unknown>): string {
    if (!useJwtExpiry(this.expiresInRaw)) {
      return jwt.sign(payload, this.secret);
    }
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresInRaw as jwt.SignOptions['expiresIn'],
    });
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
