import type { Profile } from './profile.types';

export interface ProfileSearchResult {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
  deleteById(id: string): Promise<void>;
  searchProfiles(
    q: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<ProfileSearchResult[]>;
}

export interface FriendCountProvider {
  getFriendCount(userId: string): Promise<number>;
}
