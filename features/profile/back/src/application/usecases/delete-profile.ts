import type { ProfileRepository } from '../../domain/ports';

export class DeleteProfileUseCase {
  constructor(private repository: ProfileRepository) {}

  async execute(userId: string): Promise<void> {
    await this.repository.deleteById(userId);
  }
}
