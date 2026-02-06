import type { ProfileRepository } from '../../domain/ports';

export type CreateProfileInput = {
  userId: string;
  name: string;
  username: string;
  joinedAt: string;
};

export class CreateProfileUseCase {
  constructor(private repository: ProfileRepository) {}

  async execute(input: CreateProfileInput): Promise<void> {
    const profile = {
      id: input.userId,
      name: input.name,
      username: input.username.trim() || undefined,
      joinedAt: input.joinedAt,
      bf: 0,
      nivel: 1,
      division: 'Bronce',
      patrimonio: 0,
      following: 0,
      followers: 0,
    };
    await this.repository.save(profile);
  }
}
