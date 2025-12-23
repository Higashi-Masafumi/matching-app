export type MatchCandidate = {
  id: string;
  name: string;
  universityId: string;
  matchScore: number;
  sharedInterests: string[];
  introduction?: string;
};
