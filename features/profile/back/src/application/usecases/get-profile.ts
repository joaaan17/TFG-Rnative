import type {
  CashBalanceProvider,
  FriendCountProvider,
  ProfileRepository,
} from '../../domain/ports';

export class GetProfileUseCase {
  constructor(
    private repository: ProfileRepository,
    private friendCountProvider?: FriendCountProvider,
    private cashBalanceProvider?: CashBalanceProvider,
  ) {}

  async execute(userId: string) {
    const profile = await this.repository.findById(userId);
    if (!profile) throw new Error('Perfil no encontrado');

    let result = { ...profile };

    if (this.friendCountProvider) {
      const friendCount = await this.friendCountProvider.getFriendCount(userId);
      result = { ...result, following: friendCount, followers: friendCount };
    }

    if (this.cashBalanceProvider) {
      const cashBalance = await this.cashBalanceProvider.getCashBalance(userId);
      result = { ...result, cashBalance };
      await this.repository.updateCashBalance(userId, cashBalance);
    }

    return result;
  }
}
