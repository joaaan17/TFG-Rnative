import type { ProfileRepository } from '../../../domain/ports';
import type { Profile } from '../../../domain/profile.types';
import { ProfileModel } from './profile.model';

export class MongoProfileRepository implements ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const doc = await ProfileModel.findById(id).exec();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      username: doc.username,
      joinedAt: doc.joinedAt,
      bf: doc.bf,
      following: doc.following,
      followers: doc.followers,
    };
  }
}
