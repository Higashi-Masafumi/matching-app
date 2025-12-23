import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from '../db/schema';
import { profiles } from '../db/schema';
import type { Profile } from '../../domain/entities/profile';
import type { ProfileRepository } from '../../domain/repositories/profile-repository';

type DatabaseClient = BetterSQLite3Database<typeof schema>;

export class ProfileRepositoryDrizzle implements ProfileRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const rows = await this.db.select().from(profiles).where(eq(profiles.id, id));
    const row = rows[0];
    return row ? this.mapProfile(row) : null;
  }

  async list(): Promise<Profile[]> {
    const rows = await this.db.select().from(profiles);
    return rows.map((row) => this.mapProfile(row));
  }

  async save(profile: Profile): Promise<Profile> {
    await this.db
      .insert(profiles)
      .values({
        id: profile.id,
        name: profile.name,
        universityId: profile.universityId,
        majors: JSON.stringify(profile.majors),
        interests: JSON.stringify(profile.interests),
        languages: JSON.stringify(profile.languages),
        bio: profile.bio,
        preferredLocations: JSON.stringify(profile.preferredLocations),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name: profile.name,
          universityId: profile.universityId,
          majors: JSON.stringify(profile.majors),
          interests: JSON.stringify(profile.interests),
          languages: JSON.stringify(profile.languages),
          bio: profile.bio,
          preferredLocations: JSON.stringify(profile.preferredLocations),
        },
      });

    return profile;
  }

  private mapProfile(row: typeof profiles.$inferSelect): Profile {
    return {
      id: row.id,
      name: row.name,
      universityId: row.universityId,
      majors: JSON.parse(row.majors) as string[],
      interests: JSON.parse(row.interests) as string[],
      languages: JSON.parse(row.languages) as string[],
      bio: row.bio ?? undefined,
      preferredLocations: JSON.parse(row.preferredLocations) as string[],
    } satisfies Profile;
  }
}
