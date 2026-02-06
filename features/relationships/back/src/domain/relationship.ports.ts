import type { Relationship } from './relationship.types';
import type { ProfileSummary } from './relationship.types';

export interface RelationshipRepository {
  findByPair(userAId: string, userBId: string): Promise<Relationship | null>;
  create(data: {
    userAId: string;
    userBId: string;
    requesterId: string;
    status: string;
  }): Promise<Relationship>;
  updateStatus(userAId: string, userBId: string, status: string): Promise<Relationship>;
  deleteByPair(userAId: string, userBId: string): Promise<void>;
  findAcceptedFriendIds(userId: string): Promise<string[]>;
  findPendingRequesterIds(userId: string): Promise<string[]>;
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
