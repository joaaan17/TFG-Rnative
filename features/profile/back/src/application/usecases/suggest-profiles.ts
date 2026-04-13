import type { ProfileRepository } from '../../domain/ports';
import type { RelationshipRepository } from '../../../../../relationships/back/src/domain/relationship.ports';

/**
 * Lista perfiles registrados para "añadir amigos": excluye al usuario actual,
 * amigos aceptados y cualquier relación pendiente (solicitud enviada o recibida).
 */
export class SuggestProfilesUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly relationshipRepository: RelationshipRepository,
  ) {}

  async execute(
    currentUserId: string,
    limit = 15,
    page = 1,
  ): Promise<{
    items: {
      id: string;
      name: string;
      username?: string;
      avatarUrl?: string;
    }[];
  }> {
    const trimmed = currentUserId?.trim();
    if (!trimmed) return { items: [] };

    const [friendIds, pendingOtherIds] = await Promise.all([
      this.relationshipRepository.findAcceptedFriendIds(trimmed),
      this.relationshipRepository.findOtherUserIdsInPendingRelationships(
        trimmed,
      ),
    ]);

    const exclude = [
      ...new Set([trimmed, ...friendIds, ...pendingOtherIds]),
    ];

    const items = await this.profileRepository.suggestProfiles(
      exclude,
      Math.min(100, Math.max(1, limit)),
      Math.max(1, page),
    );
    return { items };
  }
}
