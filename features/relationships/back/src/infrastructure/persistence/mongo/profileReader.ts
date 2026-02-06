import type { ProfileReaderPort } from '../../../domain/relationship.ports';
import type { ProfileSummary } from '../../../domain/relationship.types';
import { ProfileModel } from '../../../../../../profile/back/src/infrastructure/persistence/mongo/profile.model';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MongoProfileReader implements ProfileReaderPort {
  async findByUserIds(userIds: string[]): Promise<ProfileSummary[]> {
    if (userIds.length === 0) return [];
    const docs = await ProfileModel.find({
      _id: { $in: userIds.map((id) => id as unknown) },
    })
      .select('_id username name avatarUrl')
      .lean()
      .exec();
    return docs.map((d) => ({
      userId: String(d._id),
      username: d.username,
      name: d.name,
      avatarUrl: d.avatarUrl,
    }));
  }

  async searchByUserIdsAndQuery(
    userIds: string[],
    q: string,
    page: number,
    limit: number,
  ): Promise<ProfileSummary[]> {
    if (userIds.length === 0) return [];
    const qLower = q.toLowerCase().trim();
    const escaped = escapeRegex(qLower);
    const regex = new RegExp(`^${escaped}`, 'i');
    const docs = await ProfileModel.find({
      _id: { $in: userIds.map((id) => id as unknown) },
      $or: [
        { usernameLower: regex },
        { nameLower: regex },
      ],
    })
      .select('_id username name avatarUrl')
      .sort({ usernameLower: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
    return docs.map((d) => ({
      userId: String(d._id),
      username: d.username,
      name: d.name,
      avatarUrl: d.avatarUrl,
    }));
  }
}
