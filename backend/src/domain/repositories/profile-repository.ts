import type { Profile } from '../entities/profile';

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  list(): Promise<Profile[]>;
  save(profile: Profile): Promise<Profile>;
}
