import { getNivelFromExperience } from '../../../../../shared/constants/xp-level';
import type {
  ProfileRepository,
  ProfileSearchResult,
} from '../../domain/ports';
import type { Profile } from '../../domain/profile.types';

export class InMemoryProfileRepository implements ProfileRepository {
  private static profilesById = new Map<string, Profile>();

  async findById(id: string): Promise<Profile | null> {
    const profile = InMemoryProfileRepository.profilesById.get(id) ?? null;
    if (!profile) return null;
    const experience = profile.experience ?? 0;
    return { ...profile, nivel: getNivelFromExperience(experience), experience };
  }

  async save(profile: Profile): Promise<Profile> {
    InMemoryProfileRepository.profilesById.set(profile.id, profile);
    return profile;
  }

  async updateCashBalance(userId: string, cashBalance: number): Promise<void> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (profile) {
      InMemoryProfileRepository.profilesById.set(userId, {
        ...profile,
        cashBalance,
      });
    }
  }

  async addExperience(userId: string, amount: number): Promise<number> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (!profile) return 0;
    const exp = (profile.experience ?? 0) + amount;
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      experience: exp,
    });
    return exp;
  }

  async addExperienceIfNewsNotClaimed(
    userId: string,
    newsId: string,
    amount: number,
  ): Promise<{ awarded: boolean; newTotal: number }> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (!profile) return { awarded: false, newTotal: 0 };
    const claimed = (profile as Profile & { claimedNewsIds?: string[] })
      .claimedNewsIds ?? [];
    if (claimed.includes(newsId)) {
      return { awarded: false, newTotal: profile.experience ?? 0 };
    }
    const newTotal = (profile.experience ?? 0) + amount;
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      experience: newTotal,
      claimedNewsIds: [...claimed, newsId],
    } as Profile);
    return { awarded: true, newTotal };
  }

  async searchProfiles(
    _q: string,
    _page: number,
    _limit: number,
    _excludeUserId?: string,
  ): Promise<ProfileSearchResult[]> {
    return [];
  }

  async deleteById(id: string): Promise<void> {
    InMemoryProfileRepository.profilesById.delete(id);
  }
}

export default InMemoryProfileRepository;
