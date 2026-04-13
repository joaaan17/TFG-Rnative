import mongoose from 'mongoose';
import {
  computeConsultorioRemainingToday,
  CONSULTORIO_PREGUNTAS_POR_DIA,
  getConsultorioDateKey,
} from '../../../domain/consultorio-day.util';
import {
  getDivisionFromExperience,
  toExperienceNumber,
} from '../../../domain/division.utils';
import { getNivelFromExperience } from '../../../domain/level.utils';
import { computeNextStreakAfterXp } from '../../../domain/streak.utils';
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

  async recordDailyStreakActivity(userId: string): Promise<void> {
    const todayKey = getConsultorioDateKey();
    const existing = await ProfileModel.findById(userId)
      .select('bf lastStreakDayKey')
      .lean()
      .exec();

    if (!existing) {
      const streak = computeNextStreakAfterXp(0, undefined, todayKey);
      await ProfileModel.create({
        _id: userId,
        name: 'Usuario',
        bf: streak.bf,
        lastStreakDayKey: streak.lastStreakDayKey,
      });
      return;
    }

    const streak = computeNextStreakAfterXp(
      existing.bf ?? 0,
      existing.lastStreakDayKey,
      todayKey,
    );
    await ProfileModel.findByIdAndUpdate(userId, {
      $set: {
        bf: streak.bf,
        lastStreakDayKey: streak.lastStreakDayKey,
      },
    }).exec();
  }

  async addExperience(userId: string, amount: number): Promise<number> {
    const amountSafe = Math.max(0, Math.floor(amount));
    if (amountSafe === 0) {
      const d = await ProfileModel.findById(userId).select('experience').lean();
      return d?.experience ?? 0;
    }

    const todayKey = getConsultorioDateKey();
    const existing = await ProfileModel.findById(userId)
      .select('experience bf lastStreakDayKey')
      .lean()
      .exec();

    if (!existing) {
      const streak = computeNextStreakAfterXp(0, undefined, todayKey);
      const created = await ProfileModel.create({
        _id: userId,
        name: 'Usuario',
        experience: amountSafe,
        bf: streak.bf,
        lastStreakDayKey: streak.lastStreakDayKey,
      });
      return created.experience ?? 0;
    }

    const streak = computeNextStreakAfterXp(
      existing.bf ?? 0,
      existing.lastStreakDayKey,
      todayKey,
    );
    const newTotal = (existing.experience ?? 0) + amountSafe;

    const updated = await ProfileModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          experience: newTotal,
          bf: streak.bf,
          lastStreakDayKey: streak.lastStreakDayKey,
        },
      },
      { new: true },
    )
      .select('experience')
      .lean()
      .exec();
    return updated?.experience ?? 0;
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
    // Sin upsert: si el filtro no encuentra el doc (noticia ya reclamada),
    // no hay que insertar nada; el perfil ya existe con ese _id.
    // upsert:true causaba E11000 al intentar insertar un _id ya existente.
    const todayKey = getConsultorioDateKey();
    const afterXp = await ProfileModel.findOneAndUpdate(
      { _id: userId, claimedNewsIds: { $nin: [trimmed] } },
      {
        $addToSet: { claimedNewsIds: trimmed },
        $inc: { experience: amount },
      },
      { new: true, upsert: false },
    )
      .select('experience bf lastStreakDayKey')
      .lean()
      .exec();

    if (afterXp) {
      const streak = computeNextStreakAfterXp(
        afterXp.bf ?? 0,
        afterXp.lastStreakDayKey,
        todayKey,
      );
      await ProfileModel.findByIdAndUpdate(userId, {
        $set: {
          bf: streak.bf,
          lastStreakDayKey: streak.lastStreakDayKey,
        },
      }).exec();
      return { awarded: true, newTotal: afterXp.experience ?? 0 };
    }
    const fallback = await ProfileModel.findById(userId)
      .select('experience')
      .lean()
      .exec();
    return { awarded: false, newTotal: fallback?.experience ?? 0 };
  }

  async reserveConsultorioQuestion(
    userId: string,
  ): Promise<{ ok: boolean; remainingAfter: number }> {
    const todayKey = getConsultorioDateKey();

    const afterNewDay = await ProfileModel.findOneAndUpdate(
      {
        _id: userId,
        $or: [
          { consultorioDayKey: { $ne: todayKey } },
          { consultorioDayKey: { $exists: false } },
        ],
      },
      {
        $set: { consultorioDayKey: todayKey, consultorioConsultCount: 1 },
      },
      { new: true, upsert: false },
    )
      .select('consultorioDayKey consultorioConsultCount')
      .lean()
      .exec();

    if (afterNewDay) {
      return {
        ok: true,
        remainingAfter: computeConsultorioRemainingToday(
          afterNewDay.consultorioDayKey,
          afterNewDay.consultorioConsultCount,
        ),
      };
    }

    const afterSameDay = await ProfileModel.findOneAndUpdate(
      {
        _id: userId,
        consultorioDayKey: todayKey,
        consultorioConsultCount: { $lt: CONSULTORIO_PREGUNTAS_POR_DIA },
      },
      { $inc: { consultorioConsultCount: 1 } },
      { new: true, upsert: false },
    )
      .select('consultorioDayKey consultorioConsultCount')
      .lean()
      .exec();

    if (afterSameDay) {
      return {
        ok: true,
        remainingAfter: computeConsultorioRemainingToday(
          afterSameDay.consultorioDayKey,
          afterSameDay.consultorioConsultCount,
        ),
      };
    }

    const existing = await ProfileModel.findById(userId)
      .select('consultorioDayKey consultorioConsultCount')
      .lean()
      .exec();

    if (!existing) {
      const created = await ProfileModel.create({
        _id: userId,
        name: 'Usuario',
        consultorioDayKey: todayKey,
        consultorioConsultCount: 1,
      });
      return {
        ok: true,
        remainingAfter: computeConsultorioRemainingToday(
          created.consultorioDayKey,
          created.consultorioConsultCount,
        ),
      };
    }

    return {
      ok: false,
      remainingAfter: computeConsultorioRemainingToday(
        existing.consultorioDayKey,
        existing.consultorioConsultCount,
      ),
    };
  }

  async releaseConsultorioQuestion(userId: string): Promise<void> {
    await ProfileModel.findOneAndUpdate(
      { _id: userId, consultorioConsultCount: { $gt: 0 } },
      { $inc: { consultorioConsultCount: -1 } },
    ).exec();
  }

  async deleteById(id: string): Promise<void> {
    await ProfileModel.findByIdAndDelete(id).exec();
  }

  async getExperienceAndAchievementGrants(
    userId: string,
  ): Promise<{ experience: number; grantedLevels: number[] } | null> {
    const doc = await ProfileModel.findById(userId)
      .select('experience achievementCashGrantedLevels')
      .lean()
      .exec();
    if (!doc) return null;
    return {
      experience: toExperienceNumber(doc.experience),
      grantedLevels: Array.isArray(doc.achievementCashGrantedLevels)
        ? [...doc.achievementCashGrantedLevels].sort((a, b) => a - b)
        : [],
    };
  }

  async setAchievementCashGrantedLevels(
    userId: string,
    levels: number[],
  ): Promise<void> {
    const unique = [...new Set(levels)].filter((n) => n > 0).sort((a, b) => a - b);
    await ProfileModel.findByIdAndUpdate(userId, {
      $set: { achievementCashGrantedLevels: unique },
    }).exec();
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

  async suggestProfiles(
    excludeUserIds: string[],
    limit: number,
    page = 1,
  ): Promise<ProfileSearchResult[]> {
    const cap = Math.min(100, Math.max(1, Math.floor(limit)));
    const safePage = Math.max(1, Math.floor(page));
    const skip = (safePage - 1) * cap;
    const oidHex = /^[a-fA-F0-9]{24}$/;
    const oids = excludeUserIds
      .filter((id) => oidHex.test(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const docs = await ProfileModel.find({
      _id: { $nin: oids },
    })
      .select('_id name username avatarUrl')
      .sort({ nameLower: 1 })
      .skip(skip)
      .limit(cap)
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
    consultorioDayKey?: string;
    consultorioConsultCount?: number;
  }): Profile {
    const experience = toExperienceNumber(doc.experience);
    const nivel = getNivelFromExperience(experience);
    return {
      id: String(doc._id),
      name: doc.name,
      username: doc.username,
      avatarUrl: doc.avatarUrl,
      joinedAt: doc.joinedAt,
      bf: doc.bf,
      nivel,
      division: getDivisionFromExperience(experience),
      patrimonio: doc.patrimonio,
      following: doc.following,
      followers: doc.followers,
      cashBalance: doc.cashBalance,
      experience,
      consultorioRemainingToday: computeConsultorioRemainingToday(
        doc.consultorioDayKey,
        doc.consultorioConsultCount,
      ),
    };
  }
}
