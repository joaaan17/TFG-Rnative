import type { ProfileRepository } from '../../domain/ports';
import type { Profile } from '../../domain/profile.types';

export class InMemoryProfileRepository implements ProfileRepository {
  private static profilesById = new Map<string, Profile>();

  async findById(id: string): Promise<Profile | null> {
    return InMemoryProfileRepository.profilesById.get(id) ?? null;
  }
}

export default InMemoryProfileRepository;
