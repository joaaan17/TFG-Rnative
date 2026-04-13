import {
  computeConsultorioRemainingToday,
  CONSULTORIO_PREGUNTAS_POR_DIA,
  getConsultorioDateKey,
} from '../../domain/consultorio-day.util';
import {
  getDivisionFromExperience,
  toExperienceNumber,
} from '../../domain/division.utils';
import { getNivelFromExperience } from '../../domain/level.utils';
import { computeNextStreakAfterXp } from '../../domain/streak.utils';
import type {
  ProfileRepository,
  ProfileSearchResult,
} from '../../domain/ports';
import type { Profile } from '../../domain/profile.types';

export class InMemoryProfileRepository implements ProfileRepository {
  private static profilesById = new Map<string, Profile>();
  /** Estado consultorio en memoria (tests). */
  private static consultorioByUser = new Map<
    string,
    { dayKey: string; count: number }
  >();

  async findById(id: string): Promise<Profile | null> {
    const profile = InMemoryProfileRepository.profilesById.get(id) ?? null;
    if (!profile) return null;
    const experience = toExperienceNumber(profile.experience);
    const c = InMemoryProfileRepository.consultorioByUser.get(id);
    return {
      ...profile,
      nivel: getNivelFromExperience(experience),
      experience,
      division: getDivisionFromExperience(experience),
      consultorioRemainingToday: computeConsultorioRemainingToday(
        c?.dayKey,
        c?.count,
      ),
    };
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

  async recordDailyStreakActivity(userId: string): Promise<void> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    const todayKey = getConsultorioDateKey();
    if (!profile) {
      const streak = computeNextStreakAfterXp(0, undefined, todayKey);
      InMemoryProfileRepository.profilesById.set(userId, {
        id: userId,
        name: 'Usuario',
        bf: streak.bf,
        lastStreakDayKey: streak.lastStreakDayKey,
      } as Profile);
      return;
    }
    const raw = profile as Profile & { lastStreakDayKey?: string };
    const streak = computeNextStreakAfterXp(
      profile.bf ?? 0,
      raw.lastStreakDayKey,
      todayKey,
    );
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      bf: streak.bf,
      lastStreakDayKey: streak.lastStreakDayKey,
    } as Profile);
  }

  async addExperience(userId: string, amount: number): Promise<number> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (!profile) return 0;
    const amountSafe = Math.max(0, Math.floor(amount));
    if (amountSafe === 0) return profile.experience ?? 0;
    const todayKey = getConsultorioDateKey();
    const raw = profile as Profile & { lastStreakDayKey?: string };
    const streak = computeNextStreakAfterXp(
      profile.bf ?? 0,
      raw.lastStreakDayKey,
      todayKey,
    );
    const exp = (profile.experience ?? 0) + amountSafe;
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      experience: exp,
      bf: streak.bf,
      lastStreakDayKey: streak.lastStreakDayKey,
    } as Profile);
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
    const todayKey = getConsultorioDateKey();
    const raw = profile as Profile & { lastStreakDayKey?: string };
    const streak = computeNextStreakAfterXp(
      profile.bf ?? 0,
      raw.lastStreakDayKey,
      todayKey,
    );
    const newTotal = (profile.experience ?? 0) + amount;
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      experience: newTotal,
      bf: streak.bf,
      lastStreakDayKey: streak.lastStreakDayKey,
      claimedNewsIds: [...claimed, newsId],
    } as Profile);
    return { awarded: true, newTotal };
  }

  async reserveConsultorioQuestion(
    userId: string,
  ): Promise<{ ok: boolean; remainingAfter: number }> {
    const todayKey = getConsultorioDateKey();
    let state = InMemoryProfileRepository.consultorioByUser.get(userId);
    if (!state || state.dayKey !== todayKey) {
      state = { dayKey: todayKey, count: 0 };
    }
    if (state.count >= CONSULTORIO_PREGUNTAS_POR_DIA) {
      return {
        ok: false,
        remainingAfter: computeConsultorioRemainingToday(
          state.dayKey,
          state.count,
        ),
      };
    }
    const next = { dayKey: todayKey, count: state.count + 1 };
    InMemoryProfileRepository.consultorioByUser.set(userId, next);
    return {
      ok: true,
      remainingAfter: computeConsultorioRemainingToday(
        next.dayKey,
        next.count,
      ),
    };
  }

  async releaseConsultorioQuestion(userId: string): Promise<void> {
    const state = InMemoryProfileRepository.consultorioByUser.get(userId);
    if (!state || state.count <= 0) return;
    InMemoryProfileRepository.consultorioByUser.set(userId, {
      ...state,
      count: state.count - 1,
    });
  }

  async searchProfiles(
    _q: string,
    _page: number,
    _limit: number,
    _excludeUserId?: string,
  ): Promise<ProfileSearchResult[]> {
    return [];
  }

  async suggestProfiles(
    _excludeUserIds: string[],
    _limit: number,
    _page?: number,
  ): Promise<ProfileSearchResult[]> {
    return [];
  }

  async deleteById(id: string): Promise<void> {
    InMemoryProfileRepository.profilesById.delete(id);
  }

  async getExperienceAndAchievementGrants(
    userId: string,
  ): Promise<{ experience: number; grantedLevels: number[] } | null> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (!profile) return null;
    const raw = profile as Profile & { achievementCashGrantedLevels?: number[] };
    return {
      experience: toExperienceNumber(profile.experience),
      grantedLevels: [...(raw.achievementCashGrantedLevels ?? [])],
    };
  }

  async setAchievementCashGrantedLevels(
    userId: string,
    levels: number[],
  ): Promise<void> {
    const profile = InMemoryProfileRepository.profilesById.get(userId);
    if (!profile) return;
    InMemoryProfileRepository.profilesById.set(userId, {
      ...profile,
      achievementCashGrantedLevels: levels,
    } as Profile);
  }
}

export default InMemoryProfileRepository;
