import 'dotenv/config';

function requireEnv(variable: string, keyName: string): string {
  if (!variable) {
    throw new Error(
      `❌ ERROR FATAL: Falta la variable de entorno ${keyName} en el archivo .env`,
    );
  }
  return variable;
}

export const authEnv = {
  // 1. Base de Datos
  dbUri: requireEnv(process.env.AUTH_DB_URI || '', 'AUTH_DB_URI'),

  // 2. Seguridad JWT
  jwtSecret: process.env.AUTH_JWT_SECRET || '',
  jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN || '1d',

  // 3. Seguridad Hashing
  bcryptRounds: Number(process.env.AUTH_BCRYPT_ROUNDS) || 10,
};
