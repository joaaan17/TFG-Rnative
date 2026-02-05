import 'dotenv/config';

function env(key: string, fallback?: string) {
  const value = process.env[key] ?? fallback ?? '';
  return value;
}

function envNumber(key: string, fallback: number) {
  const raw = process.env[key] ?? fallback ?? '';
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

// Función para parsear y mostrar valores (sin exponer contraseñas completas)
function parseEnvValue(key: string, value: string | undefined): string {
  if (!value) return '(no definido)';
  // Para contraseñas, mostrar solo primeros y últimos caracteres
  if (key.includes('PASS')) {
    if (value.length <= 4) return '***';
    return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
  }
  return value;
}

// Parsear valores del .env para debugging
const rawValues = {
  MAIL_MODE: process.env.MAIL_MODE,
  SMTP_MODE: process.env.SMTP_MODE,
  MAIL_HOST: process.env.MAIL_HOST,
  SMTP_HOST: process.env.SMTP_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  SMTP_PORT: process.env.SMTP_PORT,
  MAIL_SECURE: process.env.MAIL_SECURE,
  SMTP_SECURE: process.env.SMTP_SECURE,
  MAIL_USER: process.env.MAIL_USER,
  SMTP_USER: process.env.SMTP_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
  SMTP_FROM: process.env.SMTP_FROM,
};

console.log('🔍 [mail.env] Valores RAW del .env:');
console.log('  MAIL_MODE:', rawValues.MAIL_MODE || '(no definido)');
console.log('  SMTP_MODE:', rawValues.SMTP_MODE || '(no definido)');
console.log('  MAIL_HOST:', rawValues.MAIL_HOST || '(no definido)');
console.log('  SMTP_HOST:', rawValues.SMTP_HOST || '(no definido)');
console.log('  MAIL_PORT:', rawValues.MAIL_PORT || '(no definido)');
console.log('  SMTP_PORT:', rawValues.SMTP_PORT || '(no definido)');
console.log('  MAIL_SECURE:', rawValues.MAIL_SECURE || '(no definido)');
console.log('  SMTP_SECURE:', rawValues.SMTP_SECURE || '(no definido)');
console.log('  MAIL_USER:', rawValues.MAIL_USER || '(no definido)');
console.log('  SMTP_USER:', rawValues.SMTP_USER || '(no definido)');
const mailPassLength = rawValues.MAIL_PASS?.length || 0;
const smtpPassLength = rawValues.SMTP_PASS?.length || 0;
const mailPassHasSpaces = rawValues.MAIL_PASS?.includes(' ') || false;
const smtpPassHasSpaces = rawValues.SMTP_PASS?.includes(' ') || false;

console.log(
  '  MAIL_PASS:',
  parseEnvValue('MAIL_PASS', rawValues.MAIL_PASS),
  `(longitud: ${mailPassLength}, espacios: ${mailPassHasSpaces ? 'SÍ' : 'NO'})`,
);
console.log(
  '  SMTP_PASS:',
  parseEnvValue('SMTP_PASS', rawValues.SMTP_PASS),
  `(longitud: ${smtpPassLength}, espacios: ${smtpPassHasSpaces ? 'SÍ' : 'NO'})`,
);

// Validación de contraseñas de Gmail
if (rawValues.MAIL_PASS || rawValues.SMTP_PASS) {
  const passToCheck = rawValues.MAIL_PASS || rawValues.SMTP_PASS || '';
  const passLength = passToCheck.length;
  const hasSpaces = passToCheck.includes(' ');

  if (hasSpaces) {
    // Con espacios: debería ser 19 caracteres (16 letras + 3 espacios)
    if (passLength !== 19) {
      console.warn(
        `⚠️  ADVERTENCIA: La contraseña tiene espacios pero longitud ${passLength}. Debería ser 19 (16 caracteres + 3 espacios).`,
      );
    }
  } else {
    // Sin espacios: debería ser exactamente 16 caracteres
    if (passLength !== 16) {
      console.warn(
        `⚠️  ADVERTENCIA: La contraseña sin espacios tiene longitud ${passLength}. Debería ser 16 caracteres para Gmail.`,
      );
    }
  }
}
console.log('  MAIL_FROM:', rawValues.MAIL_FROM || '(no definido)');
console.log('  SMTP_FROM:', rawValues.SMTP_FROM || '(no definido)');

export const mailEnv = {
  /**
   * - console: no envía emails reales (solo log)
   * - smtp: usa Nodemailer + SMTP
   */
  mode: (env('MAIL_MODE') || env('SMTP_MODE') || 'console') as
    | 'console'
    | 'smtp',

  smtp: {
    // Soporta tanto MAIL_* como SMTP_* para compatibilidad
    host: env('MAIL_HOST') || env('SMTP_HOST') || '',
    port: envNumber('MAIL_PORT', envNumber('SMTP_PORT', 587)),
    // Si el puerto es 465, secure debe ser true por defecto
    secure:
      env('MAIL_SECURE') === 'true' ||
      env('SMTP_SECURE') === 'true' ||
      envNumber('MAIL_PORT', envNumber('SMTP_PORT', 587)) === 465,
    user: env('MAIL_USER') || env('SMTP_USER') || '',
    pass: env('MAIL_PASS') || env('SMTP_PASS') || '',
    from: env('MAIL_FROM') || env('SMTP_FROM') || 'no-reply@example.com',
  },
};

// Mostrar valores parseados finales
console.log('📧 [mail.env] Valores PARSEADOS (finales):');
console.log('  mode:', mailEnv.mode);
console.log('  smtp.host:', mailEnv.smtp.host || '(vacío)');
console.log('  smtp.port:', mailEnv.smtp.port);
console.log('  smtp.secure:', mailEnv.smtp.secure);
console.log('  smtp.user:', mailEnv.smtp.user || '(vacío)');

const finalPassLength = mailEnv.smtp.pass.length;
const finalPassHasSpaces = mailEnv.smtp.pass.includes(' ');
console.log(
  '  smtp.pass:',
  parseEnvValue('PASS', mailEnv.smtp.pass),
  `(longitud: ${finalPassLength}, espacios: ${finalPassHasSpaces ? 'SÍ' : 'NO'})`,
);

// Validación final
if (mailEnv.mode === 'smtp' && mailEnv.smtp.pass) {
  if (finalPassHasSpaces && finalPassLength !== 19) {
    console.error(
      '❌ ERROR: Contraseña con espacios debe tener 19 caracteres (16 + 3 espacios)',
    );
  } else if (!finalPassHasSpaces && finalPassLength !== 16) {
    console.error(
      '❌ ERROR: Contraseña sin espacios debe tener exactamente 16 caracteres para Gmail',
    );
  }
}

console.log('  smtp.from:', mailEnv.smtp.from);

export default mailEnv;
