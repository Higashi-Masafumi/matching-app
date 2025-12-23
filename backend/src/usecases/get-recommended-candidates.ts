import type { MatchCandidate } from '../domain/entities/match';
import { NotFoundError } from '../domain/errors/domain-error';
import type { ProfileRepository } from '../domain/repositories/profile-repository';
import { MatchService } from '../domain/services/match-service';

export type GetRecommendedCandidatesInput = {
  userId: string;
  limit?: number;
  offset?: number;
};

export class GetRecommendedCandidatesUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly matchService: MatchService
  ) {}

  async execute(input: GetRecommendedCandidatesInput): Promise<{
    results: MatchCandidate[];
    nextOffset: number | null;
  }> {
    const currentProfile = await this.profileRepository.findById(input.userId);

    if (!currentProfile) {
      throw new NotFoundError('Current profile not found');
    }

    const others = await this.profileRepository.list();
    const candidates = this.matchService.generateCandidates(currentProfile, others);

    const offset = input.offset ?? 0;
    const limit = input.limit ?? 10;
    const paged = candidates.slice(offset, offset + limit);
    const nextOffset = offset + paged.length < candidates.length ? offset + paged.length : null;

    return { results: paged, nextOffset };
  }
}
