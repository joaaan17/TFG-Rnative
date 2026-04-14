import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Esto busca el .env subiendo 4 niveles desde este archivo para llegar a la raíz
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

function requireEnv(variable: string, keyName: string): string {
  if (!variable) {
    throw new Error(
      `❌ ERROR FATAL: Falta la variable de entorno ${keyName} en el archivo .env`,
    );
  }
  return variable;
}

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authEnv = {
  // 1. Base de Datos
  dbUri: requireEnv(process.env.AUTH_DB_URI || '', 'AUTH_DB_URI'),

  // 2. Seguridad JWT (tokens sin expiración: la sesión dura hasta signOut en el cliente)
  jwtSecret: process.env.AUTH_JWT_SECRET || '',

  // 3. Seguridad Hashing
  bcryptRounds: Number(process.env.AUTH_BCRYPT_ROUNDS) || 10,

  // 4. Admins (emails separados por coma, pueden eliminar cualquier cuenta)
  adminEmails: parseAdminEmails(process.env.AUTH_ADMIN_EMAILS),
};
