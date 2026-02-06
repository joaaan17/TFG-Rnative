/**
 * Tipos del dominio Relationships
 */

export type RelationshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Relationship {
  id: string;
  userAId: string;
  userBId: string;
  requesterId: string;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileSummary {
  userId: string;
  username?: string;
  name: string;
  avatarUrl?: string;
}

export interface FriendListItem extends ProfileSummary {}
