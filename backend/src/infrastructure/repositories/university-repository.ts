import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "../db/schema";
import { universities } from "../db/schema";
import type { University } from "../../domain/entities/university";
import type {
  ListUniversitiesParams,
  UniversityRepository,
} from "../../domain/repositories/university-repository";

type DatabaseClient = BetterSQLite3Database<typeof schema>;

export class UniversityRepositoryDrizzle implements UniversityRepository {
  constructor(private readonly db: DatabaseClient) {}

  async list(params: ListUniversitiesParams): Promise<University[]> {
    const rows = await this.db.select().from(universities);

    const filtered = rows
      .filter((row) => {
        let matches = true;

        if (params.country) {
          matches =
            matches &&
            row.country.toLowerCase() === params.country.toLowerCase();
        }

        if (params.program) {
          const programs = JSON.parse(row.programs) as string[];
          matches =
            matches &&
            programs.some((program) =>
              program.toLowerCase().includes(params.program!.toLowerCase()),
            );
        }

        if (params.search) {
          const haystack =
            `${row.name} ${row.city} ${row.region}`.toLowerCase();
          matches = matches && haystack.includes(params.search.toLowerCase());
        }

        return matches;
      })
      .slice(0, params.limit ?? rows.length);

    return filtered.map(
      (row) =>
        ({
          id: row.id,
          name: row.name,
          city: row.city,
          region: row.region,
          country: row.country,
          tags: JSON.parse(row.tags) as string[],
          programs: JSON.parse(row.programs) as string[],
          verificationLevel:
            row.verificationLevel as University["verificationLevel"],
          website: row.website ?? undefined,
        }) as University,
    );
  }
}
