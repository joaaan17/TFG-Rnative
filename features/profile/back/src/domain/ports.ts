import type { Profile } from './profile.types';

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
}
