import jwt from 'jsonwebtoken';
import type { TokenService } from '../../domain/ports';
import { authEnv } from '../../config/auth.env';

/**
 * Servicio JWT para INVESTIA.
 *
 * Los tokens se emiten SIN campo `exp`: la sesión es válida indefinidamente
 * hasta que el usuario cierre sesión en el cliente (signOut borra el token
 * del almacenamiento local). Esto es una decisión de diseño para una app
 * educativa / TFG donde la UX sin interrupciones es prioritaria.
 */
export class JwtTokenService implements TokenService {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret =
      secret ??
      (authEnv.jwtSecret || process.env.AUTH_JWT_SECRET || 'dev-secret');
  }

  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secret);
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
