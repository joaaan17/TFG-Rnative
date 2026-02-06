import { GetProfileUseCase } from '../application/usecases/get-profile';
import { InMemoryProfileRepository } from '../infrastructure/persistence/index';

const profileRepository = new InMemoryProfileRepository();

export const getProfileUseCase = new GetProfileUseCase(profileRepository);
