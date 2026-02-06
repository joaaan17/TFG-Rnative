import { GetProfileUseCase } from '../application/usecases/get-profile';
import { CreateProfileUseCase } from '../application/usecases/create-profile';
import { DeleteProfileUseCase } from '../application/usecases/delete-profile';
import { SearchProfilesUseCase } from '../application/usecases/search-profiles';
import { MongoProfileRepository } from '../infrastructure/persistence/mongo/mongoRepository';

const profileRepository = new MongoProfileRepository();

export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const createProfileUseCase = new CreateProfileUseCase(profileRepository);
export const deleteProfileUseCase = new DeleteProfileUseCase(profileRepository);
export const searchProfilesUseCase = new SearchProfilesUseCase(profileRepository);
