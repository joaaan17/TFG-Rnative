import type { PortfolioRepository } from '../../../../../investments/back/src/domain/ports';
import {
  ACHIEVEMENT_LEVEL_CASH_USD,
  getMilestoneLevelList,
} from '../../../../../../shared/constants/achievements';
import { getNivelFromExperience } from '../../domain/level.utils';
import type { ProfileRepository } from '../../domain/ports';

export type AchievementCashGrant = {
  level: number;
  amountUsd: number;
};

export type SyncAchievementCashRewardsResult = {
  grants: AchievementCashGrant[];
  /** Suma de grants de esta sincronización */
  totalGrantedUsd: number;
  /** Efectivo en cartera tras abonar (o el actual si no hubo nada que abonar) */
  newCashBalance: number;
};

/**
 * Abona 10.000 USD en la cartera por cada nivel-hito (5, 10, …, 80) ya alcanzado
 * y aún no pagado. Retroactivo: al cargar el perfil se regulariza lo pendiente.
 */
export class SyncAchievementCashRewardsUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly portfolioRepository: PortfolioRepository,
    private readonly portfolioInitialCash: number,
  ) {}

  async execute(userId: string): Promise<SyncAchievementCashRewardsResult> {
    const uid = typeof userId === 'string' ? userId.trim() : '';
    if (!uid) {
      return { grants: [], totalGrantedUsd: 0, newCashBalance: 0 };
    }

    const state = await this.profileRepository.getExperienceAndAchievementGrants(
      uid,
    );
    if (!state) {
      return { grants: [], totalGrantedUsd: 0, newCashBalance: 0 };
    }

    const level = getNivelFromExperience(state.experience);
    const milestones = getMilestoneLevelList();
    const granted = new Set(state.grantedLevels);
    const grants: AchievementCashGrant[] = [];

    for (const m of milestones) {
      if (level >= m && !granted.has(m)) {
        grants.push({ level: m, amountUsd: ACHIEVEMENT_LEVEL_CASH_USD });
        granted.add(m);
      }
    }

    if (grants.length === 0) {
      let port = await this.portfolioRepository.findByUserId(uid);
      if (!port) port = await this.ensurePortfolio(uid);
      return {
        grants: [],
        totalGrantedUsd: 0,
        newCashBalance: port.cashBalance,
      };
    }

    let portfolio = await this.portfolioRepository.findByUserId(uid);
    if (!portfolio) {
      portfolio = await this.ensurePortfolio(uid);
    }

    const totalAdd = grants.reduce((s, g) => s + g.amountUsd, 0);
    const newCash = portfolio.cashBalance + totalAdd;
    await this.portfolioRepository.updateCashAndHoldings(
      uid,
      newCash,
      portfolio.holdings,
    );

    const mergedLevels = Array.from(granted).sort((a, b) => a - b);
    await this.profileRepository.setAchievementCashGrantedLevels(
      uid,
      mergedLevels,
    );

    return {
      grants,
      totalGrantedUsd: totalAdd,
      newCashBalance: newCash,
    };
  }

  private async ensurePortfolio(uid: string) {
    return this.portfolioRepository.create(
      uid,
      this.portfolioInitialCash,
      'USD',
    );
  }
}
