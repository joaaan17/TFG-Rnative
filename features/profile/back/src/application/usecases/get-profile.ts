import type {
  FriendCountProvider,
  ProfileRepository,
} from '../../domain/ports';

export class GetProfileUseCase {
  constructor(
    private repository: ProfileRepository,
    private friendCountProvider?: FriendCountProvider,
  ) {}

  async execute(userId: string) {
    const profile = await this.repository.findById(userId);
    if (!profile) throw new Error('Perfil no encontrado');

    if (this.friendCountProvider) {
      const friendCount = await this.friendCountProvider.getFriendCount(userId);
      return {
        ...profile,
        following: friendCount,
        followers: friendCount,
      };
    }

    return profile;
  }
}
