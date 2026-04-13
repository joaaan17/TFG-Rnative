import type { ProfileSummary, Relationship } from './relationship.types';

export interface RelationshipRepository {
  findByPair(userAId: string, userBId: string): Promise<Relationship | null>;
  create(data: {
    userAId: string;
    userBId: string;
    requesterId: string;
    status: string;
  }): Promise<Relationship>;
  updateStatus(
    userAId: string,
    userBId: string,
    status: string,
  ): Promise<Relationship>;
  deleteByPair(userAId: string, userBId: string): Promise<void>;
  findAcceptedFriendIds(userId: string): Promise<string[]>;
  findPendingRequesterIds(userId: string): Promise<string[]>;
  /** En relaciones `pending`, devuelve el id del otro usuario (no el propio). */
  findOtherUserIdsInPendingRelationships(userId: string): Promise<string[]>;
  countAcceptedFriends(userId: string): Promise<number>;
}

export interface ProfileReaderPort {
  findByUserIds(userIds: string[]): Promise<ProfileSummary[]>;
  searchByUserIdsAndQuery(
    userIds: string[],
    q: string,
    page: number,
    limit: number,
  ): Promise<ProfileSummary[]>;
}
