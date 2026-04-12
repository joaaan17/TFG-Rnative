import type { Request, Response, NextFunction } from 'express';
import { tokenService } from '../config/auth.wiring';

export type AuthPayload = { userId: string; email: string };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  const payload = tokenService.verify<{ id: string; email: string }>(token);
  if (!payload?.id || !payload?.email) {
    res.status(401).json({ message: 'Token inválido o expirado' });
    return;
  }

  req.auth = { userId: payload.id, email: payload.email.toLowerCase() };
  next();
}

/** Si hay Bearer válido, rellena `req.auth`; si no hay token o es inválido, sigue sin error. */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    next();
    return;
  }

  const payload = tokenService.verify<{ id: string; email: string }>(token);
  if (payload?.id && payload?.email) {
    req.auth = { userId: payload.id, email: payload.email.toLowerCase() };
  }
  next();
}
