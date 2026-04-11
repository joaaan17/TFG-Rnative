import type {
  AuthRepository,
  PasswordService,
  MailService,
  OnUserRegistered,
} from '../../domain/ports';
import type { NewUser } from '../../domain/auth.types';

export class RegisterUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
    private mailService: MailService,
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

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const passwordHash = await this.passwordService.hash(data.password);

    const newUser: NewUser & { verificationCode: string; isVerified: boolean } =
      {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        verificationCode,
        isVerified: false,
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

    // Enviar email en background: no bloquea la respuesta HTTP
    this.mailService
      .sendVerificationCode(savedUser.email, verificationCode)
      .catch((err) =>
        console.error('❌ Error enviando email de verificación:', err),
      );

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      message: 'Verificación enviada al correo',
    };
  }
}
