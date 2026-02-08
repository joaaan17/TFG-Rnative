import { GetProfileUseCase } from '../application/usecases/get-profile';
import { CreateProfileUseCase } from '../application/usecases/create-profile';
import { DeleteProfileUseCase } from '../application/usecases/delete-profile';
import { SearchProfilesUseCase } from '../application/usecases/search-profiles';
import { MongoProfileRepository } from '../infrastructure/persistence/mongo/mongoRepository';
import { MongoRelationshipRepository } from '../../../../relationships/back/src/infrastructure/persistence/mongo/relationship.repository';

const profileRepository = new MongoProfileRepository();
const relationshipRepository = new MongoRelationshipRepository();

const friendCountProvider = {
  getFriendCount: (userId: string) =>
    relationshipRepository.countAcceptedFriends(userId),
};

export const getProfileUseCase = new GetProfileUseCase(
  profileRepository,
  friendCountProvider,
);
export const createProfileUseCase = new CreateProfileUseCase(profileRepository);
export const deleteProfileUseCase = new DeleteProfileUseCase(profileRepository);
export const searchProfilesUseCase = new SearchProfilesUseCase(
  profileRepository,
);
