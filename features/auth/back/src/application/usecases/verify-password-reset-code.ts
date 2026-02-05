import type { AuthRepository } from '../../domain/ports';

export class VerifyPasswordResetCodeUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, code: string) {
    // Solo verificar que el código es correcto, sin marcar como verificado
    const isValid = await this.repository.verifyCodeOnly(
      email.toLowerCase(),
      code,
    );

    if (!isValid) {
      throw new Error('Código de verificación incorrecto');
    }

    return {
      message: 'Código verificado correctamente',
    };
  }
}
