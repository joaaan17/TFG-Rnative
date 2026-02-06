import type { RelationshipRepository } from '../../domain/relationship.ports';
import type { ProfileReaderPort } from '../../domain/relationship.ports';
import type { FriendListItem } from '../../domain/relationship.types';

export interface ListFriendsInput {
  currentUserId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListFriendsOutput {
  items: FriendListItem[];
  page: number;
  limit: number;
}

export function createListFriends(
  relRepo: RelationshipRepository,
  profileReader: ProfileReaderPort,
) {
  return async function listFriends(input: ListFriendsInput): Promise<ListFriendsOutput> {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(50, Math.max(1, input.limit ?? 20));
    const search = (input.search ?? '').trim();
    const friendIds = await relRepo.findAcceptedFriendIds(input.currentUserId);
    if (friendIds.length === 0) {
      return { items: [], page, limit };
    }
    let items: FriendListItem[];
    if (search.length === 0) {
      const profiles = await profileReader.findByUserIds(friendIds);
      items = profiles
        .sort((a, b) => (a.username ?? a.name).localeCompare(b.username ?? b.name))
        .slice((page - 1) * limit, page * limit);
    } else {
      items = await profileReader.searchByUserIdsAndQuery(
        friendIds,
        search.slice(0, 50),
        page,
        limit,
      );
    }
    return { items, page, limit };
  };
}
