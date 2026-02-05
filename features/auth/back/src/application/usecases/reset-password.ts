import type { AuthRepository, PasswordService } from '../../domain/ports';

export class ResetPasswordUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
  ) {}

  async execute(email: string, code: string, newPassword: string) {
    // 1. Verificar que el código es válido
    const user = await this.repository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new Error('Código de verificación incorrecto');
    }

    // 2. Validar que la nueva contraseña no esté vacía
    if (!newPassword || newPassword.trim().length === 0) {
      throw new Error('La contraseña no puede estar vacía');
    }

    // 3. Hashear la nueva contraseña
    const newPasswordHash = await this.passwordService.hash(newPassword);

    // 4. Actualizar la contraseña y limpiar el código de verificación en una sola operación
    // Primero actualizar la contraseña
    const updatedUser = await this.repository.updatePassword(
      email.toLowerCase(),
      newPasswordHash,
    );

    if (!updatedUser) {
      throw new Error('Error al actualizar la contraseña en la base de datos');
    }

    // 5. Limpiar el código de verificación después de cambiar la contraseña exitosamente
    await this.repository.updateVerificationCode(email.toLowerCase(), '');

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}
