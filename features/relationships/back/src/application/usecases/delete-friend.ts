import type { RelationshipRepository } from '../../domain/relationship.ports';
import { RelationshipNotFoundError } from '../../domain/relationship.errors';
import { normalizePair } from '../../domain/normalizePair';

export interface DeleteFriendInput {
  currentUserId: string;
  friendUserId: string;
}

export function createDeleteFriend(repo: RelationshipRepository) {
  return async function deleteFriend(input: DeleteFriendInput): Promise<void> {
    const { userAId, userBId } = normalizePair(input.currentUserId, input.friendUserId);
    const existing = await repo.findByPair(userAId, userBId);
    if (!existing) {
      throw new RelationshipNotFoundError('Relationship not found');
    }
    if (existing.status !== 'accepted') {
      throw new RelationshipNotFoundError('Not friends');
    }
    await repo.deleteByPair(userAId, userBId);
  };
}
