import type { RelationshipRepository } from '../../domain/relationship.ports';
import {
  RelationshipForbiddenError,
  RelationshipNotFoundError,
} from '../../domain/relationship.errors';
import { normalizePair } from '../../domain/normalizePair';

export interface RejectFriendshipInput {
  currentUserId: string;
  fromUserId: string; // requester original (receptor rechaza) o currentUserId cancela
}

export function createRejectFriendship(repo: RelationshipRepository) {
  return async function rejectFriendship(input: RejectFriendshipInput): Promise<void> {
    const { userAId, userBId } = normalizePair(input.currentUserId, input.fromUserId);
    const existing = await repo.findByPair(userAId, userBId);
    if (!existing) {
      throw new RelationshipNotFoundError('Relationship not found');
    }
    if (existing.status !== 'pending') {
      throw new RelationshipForbiddenError('Request is not pending');
    }
    const isReceiver = existing.requesterId !== input.currentUserId;
    const isRequester = existing.requesterId === input.currentUserId;
    if (!isReceiver && !isRequester) {
      throw new RelationshipForbiddenError('You cannot reject this request');
    }
    await repo.deleteByPair(userAId, userBId);
  };
}
