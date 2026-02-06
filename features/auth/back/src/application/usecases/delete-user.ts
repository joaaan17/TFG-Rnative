import type { AuthRepository, OnUserDeleted } from '../../domain/ports';

export class DeleteUserUseCase {
  constructor(
    private repository: AuthRepository,
    private onUserDeleted?: OnUserDeleted,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    await this.repository.deleteById(userId);

    if (this.onUserDeleted) {
      await this.onUserDeleted.execute(userId);
    }
  }
}
