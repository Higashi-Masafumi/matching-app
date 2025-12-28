import { MatchService } from "./domain/services/match-service";
import { bootstrapDatabase } from "./infrastructure/db/bootstrap";
import { createDatabaseClient } from "./infrastructure/db/client";
import { ConfigurationRepositoryDrizzle } from "./infrastructure/repositories/configuration-repository";
import { ProfileRepositoryDrizzle } from "./infrastructure/repositories/profile-repository";
import { UniversityRepositoryDrizzle } from "./infrastructure/repositories/university-repository";
import { GetCatalogConfigurationUseCase } from "./usecases/get-catalog-configuration";
import { GetRecommendedCandidatesUseCase } from "./usecases/get-recommended-candidates";
import { ListUniversitiesUseCase } from "./usecases/list-universities";
import { UpdateProfileUseCase } from "./usecases/update-profile";

export const createContainer = () => {
  const databaseClient = createDatabaseClient();
  bootstrapDatabase(databaseClient.connection);

  const universityRepository = new UniversityRepositoryDrizzle(
    databaseClient.db,
  );
  const profileRepository = new ProfileRepositoryDrizzle(databaseClient.db);
  const configurationRepository = new ConfigurationRepositoryDrizzle(
    databaseClient.db,
  );

  const matchService = new MatchService();

  return {
    universityRepository,
    profileRepository,
    configurationRepository,
    listUniversitiesUseCase: new ListUniversitiesUseCase(universityRepository),
    updateProfileUseCase: new UpdateProfileUseCase(profileRepository),
    getRecommendedCandidatesUseCase: new GetRecommendedCandidatesUseCase(
      profileRepository,
      matchService,
    ),
    getCatalogConfigurationUseCase: new GetCatalogConfigurationUseCase(
      configurationRepository,
    ),
  };
};

export type AppContainer = ReturnType<typeof createContainer>;
