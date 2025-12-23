export type Profile = {
  id: string;
  name: string;
  universityId: string;
  majors: string[];
  interests: string[];
  languages: string[];
  bio?: string;
  preferredLocations: string[];
};
