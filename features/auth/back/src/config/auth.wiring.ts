import {
  createProfileUseCase,
  deleteProfileUseCase,
} from '../../../../profile/back/src/config/profile.wiring';
import { LoginUseCase } from '../application/usecases/login';
import { DeleteUserUseCase } from '../application/usecases/delete-user';
import { BcryptHasher } from '../infrastructure/crypto/bcryptHasher';
import { JwtTokenService } from '../infrastructure/tokens/jwtTokerService';
import { MongoAuthRepository } from '../infrastructure/persistence/mongo/mongoRepository';
import { RegisterUseCase } from '../application/usecases/register';
import { VerifyUseCase } from '../application/usecases/verify';
import { ResendCodeUseCase } from '../application/usecases/resend-code';
import { ResetPasswordUseCase } from '../application/usecases/reset-password';
import { SendPasswordResetCodeUseCase } from '../application/usecases/send-password-reset-code';
import { VerifyPasswordResetCodeUseCase } from '../application/usecases/verify-password-reset-code';
import { NodemailerService } from '../infrastructure/mail/nodemailerService';
import { ConsoleMailService } from '../infrastructure/mail/consoleMailService';
import { mailEnv } from './mail.env';

const authRepository = new MongoAuthRepository();
const passwordService = new BcryptHasher();
export const tokenService = new JwtTokenService();

// Validar configuración de email antes de crear el servicio
if (mailEnv.mode === 'smtp') {
  const { host, user, pass } = mailEnv.smtp;
  if (!host || !user || !pass) {
    console.warn(
      '⚠️  MAIL_MODE=smtp pero faltan variables: MAIL_HOST, MAIL_USER o MAIL_PASS. Usando modo console.',
    );
    console.warn('   Configuración actual:', {
      host: host || '(vacío)',
      user: user || '(vacío)',
      pass: pass ? '***' : '(vacío)',
      port: mailEnv.smtp.port,
      secure: mailEnv.smtp.secure,
    });
  } else {
    console.log('📧 Configuración SMTP detectada:', {
      host: mailEnv.smtp.host,
      port: mailEnv.smtp.port,
      secure: mailEnv.smtp.secure,
      user: mailEnv.smtp.user,
      from: mailEnv.smtp.from,
    });
  }
} else {
  console.log('📧 Modo email: console (no se envían emails reales)');
}

const mailService =
  mailEnv.mode === 'smtp' &&
  mailEnv.smtp.host &&
  mailEnv.smtp.user &&
  mailEnv.smtp.pass
    ? new NodemailerService(mailEnv.smtp)
    : new ConsoleMailService();

//Caso de uso de login
export const loginUseCase = new LoginUseCase(
  authRepository,
  passwordService,
  tokenService,
);

// Caso de uso de registro (crea perfil automáticamente, login directo sin verificación email)
export const registerUseCase = new RegisterUseCase(
  authRepository,
  passwordService,
  tokenService,
  createProfileUseCase,
);

// Caso de uso de verificación
export const verifyUseCase = new VerifyUseCase(authRepository, tokenService);

// Caso de uso de reenvío de código
export const resendCodeUseCase = new ResendCodeUseCase(
  authRepository,
  mailService,
);

// Caso de uso de reset de contraseña
export const resetPasswordUseCase = new ResetPasswordUseCase(
  authRepository,
  passwordService,
);

// Caso de uso para enviar código de recuperación de contraseña
export const sendPasswordResetCodeUseCase = new SendPasswordResetCodeUseCase(
  authRepository,
  mailService,
);

// Caso de uso para verificar código de recuperación de contraseña
export const verifyPasswordResetCodeUseCase =
  new VerifyPasswordResetCodeUseCase(authRepository);

// Caso de uso para eliminar usuario (borra perfil en cascada)
export const deleteUserUseCase = new DeleteUserUseCase(
  authRepository,
  deleteProfileUseCase,
);
