export type University = {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  tags: string[];
  programs: string[];
  verificationLevel: "basic" | "strict";
  website?: string;
};
