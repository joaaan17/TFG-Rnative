import type { ProfileRepository } from '../../domain/ports';

export class SearchProfilesUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  async execute(
    q: string,
    page = 1,
    limit = 20,
    excludeUserId?: string,
  ): Promise<{
    items: {
      id: string;
      name: string;
      username?: string;
      avatarUrl?: string;
    }[];
  }> {
    const items = await this.profileRepository.searchProfiles(
      q,
      page,
      limit,
      excludeUserId,
    );
    return { items };
  }
}
