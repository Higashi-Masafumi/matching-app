export type IntentOption = {
  id: string;
  label: string;
  description: string;
  radiusKm?: number | null;
};

export type WeightPreset = {
  id: string;
  title: string;
  weights: {
    major: number;
    campus: number;
    activity: number;
  };
  note: string;
  isActive: boolean;
};

export type VerificationFlag = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

export type CatalogConfiguration = {
  intents: IntentOption[];
  weightPresets: WeightPreset[];
  verificationFlags: VerificationFlag[];
};
