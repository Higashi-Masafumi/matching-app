import type { CatalogConfiguration } from "../domain/entities/configuration";
import type { ConfigurationRepository } from "../domain/repositories/configuration-repository";

export class GetCatalogConfigurationUseCase {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  execute(): Promise<CatalogConfiguration> {
    return this.configurationRepository.getCatalogConfiguration();
  }
}
