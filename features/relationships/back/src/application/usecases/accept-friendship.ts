import type { RelationshipRepository } from '../../domain/relationship.ports';
import {
  RelationshipForbiddenError,
  RelationshipNotFoundError,
} from '../../domain/relationship.errors';
import { normalizePair } from '../../domain/normalizePair';

export interface AcceptFriendshipInput {
  currentUserId: string;
  fromUserId: string; // requester original
}

export interface AcceptFriendshipOutput {
  id: string;
  status: string;
}

export function createAcceptFriendship(repo: RelationshipRepository) {
  return async function acceptFriendship(
    input: AcceptFriendshipInput,
  ): Promise<AcceptFriendshipOutput> {
    const { userAId, userBId } = normalizePair(input.currentUserId, input.fromUserId);
    const existing = await repo.findByPair(userAId, userBId);
    if (!existing) {
      throw new RelationshipNotFoundError('Relationship not found');
    }
    if (existing.status !== 'pending') {
      throw new RelationshipForbiddenError('Request is not pending');
    }
    if (existing.requesterId === input.currentUserId) {
      throw new RelationshipForbiddenError('Only the receiver can accept the request');
    }
    const rel = await repo.updateStatus(userAId, userBId, 'accepted');
    return { id: rel.id, status: rel.status };
  };
}
