import { GetProfileUseCase } from '../application/usecases/get-profile';
import { CreateProfileUseCase } from '../application/usecases/create-profile';
import { DeleteProfileUseCase } from '../application/usecases/delete-profile';
import { SearchProfilesUseCase } from '../application/usecases/search-profiles';
import { AwardExperienceUseCase } from '../application/usecases/award-experience.usecase';
import { MongoProfileRepository } from '../infrastructure/persistence/mongo/mongoRepository';
import { MongoRelationshipRepository } from '../../../../relationships/back/src/infrastructure/persistence/mongo/relationship.repository';
import { MongoPortfolioRepository } from '../../../../investments/back/src/infrastructure/persistence/mongo/portfolio.repository';

const profileRepository = new MongoProfileRepository();
const relationshipRepository = new MongoRelationshipRepository();
const initialCash = Number(process.env.PORTFOLIO_INITIAL_CASH) || 10_000;
const portfolioRepository = new MongoPortfolioRepository(initialCash);

const friendCountProvider = {
  getFriendCount: (userId: string) =>
    relationshipRepository.countAcceptedFriends(userId),
};

const cashBalanceProvider = {
  getCashBalance: async (userId: string) => {
    const portfolio = await portfolioRepository.findByUserId(userId);
    return portfolio?.cashBalance ?? 0;
  },
};

export const getProfileUseCase = new GetProfileUseCase(
  profileRepository,
  friendCountProvider,
  cashBalanceProvider,
);
export const createProfileUseCase = new CreateProfileUseCase(profileRepository);
export const deleteProfileUseCase = new DeleteProfileUseCase(profileRepository);
export const searchProfilesUseCase = new SearchProfilesUseCase(
  profileRepository,
);
export const awardExperienceUseCase = new AwardExperienceUseCase(
  profileRepository,
);
