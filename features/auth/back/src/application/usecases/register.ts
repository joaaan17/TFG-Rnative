import type {
  AuthRepository,
  PasswordService,
  TokenService,
  OnUserRegistered,
} from '../../domain/ports';
import type { NewUser } from '../../domain/auth.types';

export class RegisterUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private onUserRegistered?: OnUserRegistered,
  ) {}

  async execute(data: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) {
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error('El usuario ya existe');
      }
      await this.repository.deleteById(existingUser.id);
    }

    const passwordHash = await this.passwordService.hash(data.password);

    const newUser: NewUser & { verificationCode: string; isVerified: boolean } =
      {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        verificationCode: '',
        isVerified: true,
      };

    const savedUser = await this.repository.save(newUser);

    if (this.onUserRegistered) {
      await this.onUserRegistered.execute({
        userId: savedUser.id,
        name: savedUser.name,
        username: data.username,
        joinedAt: new Date().toISOString(),
      });
    }

    const token = this.tokenService.sign({
      id: savedUser.id,
      email: savedUser.email,
    });

    return {
      token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      },
    };
  }
}
