import type { AuthRepository, PasswordService } from '../../domain/ports';
import type { NewUser } from '../../domain/auth.types';

export class RegisterUseCase {
  constructor(
    private repository: AuthRepository,
    private passwordService: PasswordService,
  ) {}

  async execute(data: { email: string; password: string; name: string }) {
    // 1. Validar si el usuario ya existe
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) throw new Error('El usuario ya existe');

    // 2. Hashear la contraseña
    const passwordHash = await this.passwordService.hash(data.password);

    // 3. Crear la entidad de usuario (Dominio)
    const newUser: NewUser = {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
    };

    // 4. Guardar en persistencia (sea Mongo, SQL o Memoria)
    const savedUser = await this.repository.save(newUser);

    return { id: savedUser.id, email: savedUser.email, name: savedUser.name };
  }
}
