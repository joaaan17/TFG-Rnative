import type {
  AuthRepository,
  PasswordService,
  TokenService,
} from '../../domain/ports';

export class LoginUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {}

  async execute(email: string, password: string) {
    // 1. Buscar usuario
    const user = await this.repository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    // 2. Verificar password
    const isValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isValid) throw new Error('Credenciales inválidas');

    // 3. Generar token
    const token = this.tokenService.sign({ id: user.id, email: user.email });

    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }
}
