import type {
  RelationshipRepository,
  ProfileReaderPort,
} from '../../domain/relationship.ports';
import type { ProfileSummary } from '../../domain/relationship.types';

export interface ListPendingRequestsInput {
  currentUserId: string;
}

export interface PendingRequestItem extends ProfileSummary {}

export interface ListPendingRequestsOutput {
  items: PendingRequestItem[];
}

export function createListPendingRequests(
  relRepo: RelationshipRepository,
  profileReader: ProfileReaderPort,
) {
  return async function listPendingRequests(
    input: ListPendingRequestsInput,
  ): Promise<ListPendingRequestsOutput> {
    const requesterIds = await relRepo.findPendingRequesterIds(
      input.currentUserId,
    );
    if (requesterIds.length === 0) {
      return { items: [] };
    }
    const profiles = await profileReader.findByUserIds(requesterIds);
    return {
      items: profiles.sort((a, b) =>
        (a.username ?? a.name).localeCompare(b.username ?? b.name),
      ),
    };
  };
}
