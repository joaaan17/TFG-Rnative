import type { AuthRepository, MailService } from '../../domain/ports';

export class SendPasswordResetCodeUseCase {
  constructor(
    private authRepository: AuthRepository,
    private mailService: MailService,
  ) {}

  async execute(email: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Para recuperación de contraseña, no importa si el usuario está verificado o no
    // Generar nuevo código de verificación
    const newVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Actualizar el código en la base de datos
    await this.authRepository.updateVerificationCode(
      email,
      newVerificationCode,
    );

    // Enviar el código por email
    await this.mailService.sendVerificationCode(
      user.email,
      newVerificationCode,
    );

    return { message: 'Código de recuperación enviado' };
  }
}
