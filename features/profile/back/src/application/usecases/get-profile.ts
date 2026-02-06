import type { ProfileRepository } from '../../domain/ports';

export class GetProfileUseCase {
  constructor(private repository: ProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.repository.findById(userId);
    if (!profile) throw new Error('Perfil no encontrado');
    return profile;
  }
}
