import type { AuthRepository, MailService } from '../../domain/ports';

export class ResendCodeUseCase {
  constructor(
    private repository: AuthRepository,
    private mailService: MailService,
  ) {}

  async execute(email: string) {
    // 1. Verificar que el usuario existe
    const user = await this.repository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Si ya está verificado, no tiene sentido reenviar
    if (user.isVerified) {
      throw new Error('El usuario ya está verificado');
    }

    // 3. Generar nuevo código
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 4. Actualizar el código en la base de datos
    await this.repository.updateVerificationCode(
      email.toLowerCase(),
      verificationCode,
    );

    // 5. Enviar el nuevo código por email
    await this.mailService.sendVerificationCode(
      email.toLowerCase(),
      verificationCode,
    );

    return { message: 'Código reenviado exitosamente' };
  }
}
