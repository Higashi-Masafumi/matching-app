import type { MatchCandidate } from '../entities/match';
import type { Profile } from '../entities/profile';

export class MatchService {
  generateCandidates(current: Profile, others: Profile[]): MatchCandidate[] {
    return others
      .filter((profile) => profile.id !== current.id)
      .map((profile) => {
        const sharedInterests = profile.interests.filter((interest) =>
          current.interests.includes(interest)
        );

        const sharedMajors = profile.majors.filter((major) => current.majors.includes(major));
        const sharedLanguages = profile.languages.filter((language) =>
          current.languages.includes(language)
        );

        const interestScore = sharedInterests.length / Math.max(profile.interests.length, 1);
        const majorScore = sharedMajors.length / Math.max(profile.majors.length, 1);
        const languageScore = sharedLanguages.length / Math.max(profile.languages.length, 1);

        const matchScore = Number(
          (interestScore * 0.5 + majorScore * 0.3 + languageScore * 0.2).toFixed(2)
        );

        return {
          id: profile.id,
          name: profile.name,
          universityId: profile.universityId,
          matchScore,
          sharedInterests,
          introduction: profile.bio,
        } satisfies MatchCandidate;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
