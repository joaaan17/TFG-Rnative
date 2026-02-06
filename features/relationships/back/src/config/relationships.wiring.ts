import { createRequestFriendship } from '../application/relationships/request-friendship';
import { createAcceptFriendship } from '../application/relationships/accept-friendship';
import { createRejectFriendship } from '../application/relationships/reject-friendship';
import { createDeleteFriend } from '../application/relationships/delete-friend';
import { createListFriends } from '../application/relationships/list-friends';
import { createListPendingRequests } from '../application/relationships/list-pending-requests';
import { MongoRelationshipRepository } from '../infrastructure/persistence/mongo/relationship.repository';
import { MongoProfileReader } from '../infrastructure/persistence/mongo/profileReader';

const relationshipRepository = new MongoRelationshipRepository();
const profileReader = new MongoProfileReader();

export const requestFriendship = createRequestFriendship(
  relationshipRepository,
);
export const acceptFriendship = createAcceptFriendship(relationshipRepository);
export const rejectFriendship = createRejectFriendship(relationshipRepository);
export const deleteFriend = createDeleteFriend(relationshipRepository);
export const listFriends = createListFriends(
  relationshipRepository,
  profileReader,
);
export const listPendingRequests = createListPendingRequests(
  relationshipRepository,
  profileReader,
);
