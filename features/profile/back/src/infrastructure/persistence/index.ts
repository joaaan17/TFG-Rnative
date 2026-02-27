import type { ProfileRepository } from '../../domain/ports';
import type { Profile } from '../../domain/profile.types';

export class InMemoryProfileRepository implements ProfileRepository {
  private static profilesById = new Map<string, Profile>();

  async findById(id: string): Promise<Profile | null> {
    return InMemoryProfileRepository.profilesById.get(id) ?? null;
  }

  async save(profile: Profile): Promise<Profile> {
    InMemoryProfileRepository.profilesById.set(profile.id, profile);
    return profile;
  }

  async updateCashBalance(userId: string, cashBalance: number): Promise<void> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (profile) {
      InMemoryProfileRepository.profilesById.set(userId, { ...profile, cashBalance });
    }
  }

  async deleteById(id: string): Promise<void> {
    InMemoryProfileRepository.profilesById.delete(id);
  }
}

export default InMemoryProfileRepository;
