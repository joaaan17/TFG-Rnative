import type {
  AuthRepository,
  PasswordService,
  MailService,
} from '../../domain/ports';
import type { NewUser } from '../../domain/auth.types';

export class RegisterUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
    private mailService: MailService, // <--- Nueva dependencia inyectada
  ) {}

  async execute(data: { email: string; password: string; name: string }) {
    // 1. Validar si el usuario ya existe
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) throw new Error('El usuario ya existe');

    // 2. Generar código de verificación (6 dígitos aleatorios)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 3. Hashear la contraseña
    const passwordHash = await this.passwordService.hash(data.password);

    // 4. Crear la entidad de usuario (Dominio)
    // Añadimos isVerified y el código al objeto que persistiremos
    const newUser: NewUser & { verificationCode: string; isVerified: boolean } =
      {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        verificationCode, // Guardamos el código para validarlo luego
        isVerified: false, // Por defecto no está verificado
      };

    // 5. Guardar en persistencia (Mongo/SQL)
    const savedUser = await this.repository.save(newUser);

    // 6. Enviar el correo electrónico (después de persistir para no perder el código)
    // El caso de uso no sabe si es Gmail, SendGrid o Log, solo ordena enviarlo
    await this.mailService.sendVerificationCode(
      savedUser.email,
      verificationCode,
    );

    // 7. Retornar datos (sin el hash ni el código de verificación por seguridad)
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      message: 'Verificación enviada al correo',
    };
  }
}
