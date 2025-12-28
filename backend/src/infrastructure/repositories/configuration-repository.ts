import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "../db/schema";
import { intentOptions, verificationFlags, weightPresets } from "../db/schema";
import type { CatalogConfiguration } from "../../domain/entities/configuration";
import type { ConfigurationRepository } from "../../domain/repositories/configuration-repository";

type DatabaseClient = BetterSQLite3Database<typeof schema>;

export class ConfigurationRepositoryDrizzle implements ConfigurationRepository {
  constructor(private readonly db: DatabaseClient) {}

  async getCatalogConfiguration(): Promise<CatalogConfiguration> {
    const [intentRows, weightRows, verificationRows] = await Promise.all([
      this.db.select().from(intentOptions),
      this.db.select().from(weightPresets),
      this.db.select().from(verificationFlags),
    ]);

    return {
      intents: intentRows.map((row) => ({
        id: row.id,
        label: row.label,
        description: row.description,
        radiusKm: row.radiusKm ?? null,
      })),
      weightPresets: weightRows.map((row) => ({
        id: row.id,
        title: row.title,
        weights: {
          major: row.weightMajor,
          campus: row.weightCampus,
          activity: row.weightActivity,
        },
        note: row.note,
        isActive: row.isActive,
      })),
      verificationFlags: verificationRows.map((row) => ({
        id: row.id,
        label: row.label,
        description: row.description,
        required: row.required,
      })),
    } satisfies CatalogConfiguration;
  }
}
