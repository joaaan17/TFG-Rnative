import type {
  AuthRepository,
  TokenService,
  MailService,
} from '../../domain/ports';

export class VerifyUseCase {
  constructor(
    private repository: AuthRepository,
    private tokenService: TokenService,
  ) {}

  async execute(email: string, code: string) {
    // 1. Verificar el código
    const user = await this.repository.verifyCode(email.toLowerCase(), code);

    if (!user) {
      throw new Error('Código inválido o expirado');
    }

    // 2. Generar token JWT
    const token = this.tokenService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
