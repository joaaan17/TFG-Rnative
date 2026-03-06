import mongoose from 'mongoose';
import { getNivelFromExperience } from '../../../../../../shared/constants/xp-level';
import type {
  ProfileRepository,
  ProfileSearchResult,
} from '../../../domain/ports';
import type { Profile } from '../../../domain/profile.types';
import { ProfileModel } from './profile.model';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MongoProfileRepository implements ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const doc = await ProfileModel.findById(id).exec();
    if (!doc) return null;
    return this.mapDocToProfile(doc);
  }

  async updateCashBalance(userId: string, cashBalance: number): Promise<void> {
    await ProfileModel.findByIdAndUpdate(userId, {
      $set: { cashBalance },
    }).exec();
  }

  async addExperience(userId: string, amount: number): Promise<number> {
    const doc = await ProfileModel.findByIdAndUpdate(
      userId,
      { $inc: { experience: amount } },
      { new: true },
    )
      .select('experience')
      .lean()
      .exec();
    return doc?.experience ?? 0;
  }

  async addExperienceIfNewsNotClaimed(
    userId: string,
    newsId: string,
    amount: number,
  ): Promise<{ awarded: boolean; newTotal: number }> {
    const trimmed = (newsId || '').trim();
    if (!trimmed) {
      const doc = await ProfileModel.findById(userId)
        .select('experience')
        .lean()
        .exec();
      return { awarded: false, newTotal: doc?.experience ?? 0 };
    }
    const updated = await ProfileModel.findOneAndUpdate(
      { _id: userId, claimedNewsIds: { $nin: [trimmed] } },
      {
        $addToSet: { claimedNewsIds: trimmed },
        $inc: { experience: amount },
      },
      { new: true },
    )
      .select('experience')
      .lean()
      .exec();
    if (updated) {
      return { awarded: true, newTotal: updated.experience ?? 0 };
    }
    const existing = await ProfileModel.findById(userId)
      .select('experience')
      .lean()
      .exec();
    return { awarded: false, newTotal: existing?.experience ?? 0 };
  }

  async deleteById(id: string): Promise<void> {
    await ProfileModel.findByIdAndDelete(id).exec();
  }

  async searchProfiles(
    q: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<ProfileSearchResult[]> {
    const trimmed = q.trim().slice(0, 50);
    if (!trimmed) return [];
    const escaped = escapeRegex(trimmed.toLowerCase());
    const regex = new RegExp(`^${escaped}`, 'i');
    const filter: Record<string, unknown> = {
      $or: [{ usernameLower: regex }, { nameLower: regex }],
    };
    if (excludeUserId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }
    const docs = await ProfileModel.find(filter)
      .select('_id name username avatarUrl')
      .sort({ usernameLower: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      username: d.username,
      avatarUrl: d.avatarUrl,
    }));
  }

  async save(profile: Profile): Promise<Profile> {
    const doc = await ProfileModel.findByIdAndUpdate(
      profile.id,
      {
        $setOnInsert: {
          name: profile.name,
          username: profile.username ?? null,
          usernameLower: (profile.username ?? '').toLowerCase().trim(),
          nameLower: (profile.name ?? '').toLowerCase().trim(),
          avatarUrl: profile.avatarUrl ?? null,
          joinedAt: profile.joinedAt ?? null,
          bf: profile.bf ?? 0,
          nivel: profile.nivel ?? 1,
          division: profile.division ?? 'Bronce',
          patrimonio: profile.patrimonio ?? 0,
          following: profile.following ?? 0,
          followers: profile.followers ?? 0,
          cashBalance: profile.cashBalance ?? 0,
          experience: profile.experience ?? 0,
        },
      },
      { upsert: true, new: true },
    ).exec();
    return this.mapDocToProfile(doc!);
  }

  private mapDocToProfile(doc: {
    _id: unknown;
    name: string;
    username?: string;
    avatarUrl?: string;
    joinedAt?: string;
    bf?: number;
    nivel?: number;
    division?: string;
    patrimonio?: number;
    following?: number;
    followers?: number;
    cashBalance?: number;
    experience?: number;
  }): Profile {
    const experience = doc.experience ?? 0;
    const nivel = getNivelFromExperience(experience);
    return {
      id: String(doc._id),
      name: doc.name,
      username: doc.username,
      avatarUrl: doc.avatarUrl,
      joinedAt: doc.joinedAt,
      bf: doc.bf,
      nivel,
      division: doc.division,
      patrimonio: doc.patrimonio,
      following: doc.following,
      followers: doc.followers,
      cashBalance: doc.cashBalance,
      experience,
    };
  }
}
