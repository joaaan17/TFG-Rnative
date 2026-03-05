import type { RelationshipRepository } from '../../domain/relationship.ports';
import {
  RelationshipConflictError,
  RelationshipForbiddenError,
} from '../../domain/relationship.errors';
import { normalizePair } from '../../domain/normalizePair';

export interface RequestFriendshipInput {
  currentUserId: string;
  targetUserId: string;
}

export interface RequestFriendshipOutput {
  id: string;
  status: string;
}

export function createRequestFriendship(repo: RelationshipRepository) {
  return async function requestFriendship(
    input: RequestFriendshipInput,
  ): Promise<RequestFriendshipOutput> {
    if (input.currentUserId === input.targetUserId) {
      throw new RelationshipForbiddenError(
        'Cannot send friend request to yourself',
      );
    }
    const { userAId, userBId } = normalizePair(
      input.currentUserId,
      input.targetUserId,
    );
    const existing = await repo.findByPair(userAId, userBId);
    if (existing) {
      if (existing.status === 'pending') {
        throw new RelationshipConflictError('Request already exists');
      }
      if (existing.status === 'accepted') {
        throw new RelationshipConflictError('Already friends');
      }
      if (existing.status === 'blocked') {
        throw new RelationshipForbiddenError('Relationship is blocked');
      }
    }
    const rel = await repo.create({
      userAId,
      userBId,
      requesterId: input.currentUserId,
      status: 'pending',
    });
    return { id: rel.id, status: rel.status };
  };
}
