import type { CatalogConfiguration } from "../entities/configuration";

export interface ConfigurationRepository {
  getCatalogConfiguration(): Promise<CatalogConfiguration>;
}
