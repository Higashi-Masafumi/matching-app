import type { Profile } from "../domain/entities/profile";
import { NotFoundError, ValidationError } from "../domain/errors/domain-error";
import type { ProfileRepository } from "../domain/repositories/profile-repository";

export type UpdateProfileInput = Partial<Omit<Profile, "id">> & { id: string };

export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(input: UpdateProfileInput): Promise<Profile> {
    const existing = await this.profileRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError("Profile not found");
    }

    const updated: Profile = {
      ...existing,
      ...input,
      majors: input.majors ?? existing.majors,
      interests: input.interests ?? existing.interests,
      languages: input.languages ?? existing.languages,
      preferredLocations:
        input.preferredLocations ?? existing.preferredLocations,
    };

    this.validate(updated);

    return this.profileRepository.save(updated);
  }

  private validate(profile: Profile) {
    if (!profile.name.trim()) {
      throw new ValidationError("Profile name is required");
    }

    if (!profile.universityId) {
      throw new ValidationError("University must be specified");
    }
  }
}
