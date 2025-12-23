export type CampusRecord = {
  id: string;
  name: string;
  city: string;
  region: string;
  tags: string[];
  programs: string[];
  verificationLevel: 'basic' | 'strict';
};

export type IntentOption = {
  id: 'same' | 'nearby' | 'open' | string;
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

type CatalogConfigurationResponse = {
  intents: IntentOption[];
  weightPresets: WeightPreset[];
  verificationFlags: VerificationFlag[];
};

type UniversityResponse = {
  total: number;
  results: (CampusRecord & { country: string; website?: string })[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const apiGet = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as T;
};

let cachedConfiguration: CatalogConfigurationResponse | null = null;

const fetchConfiguration = async () => {
  if (cachedConfiguration) return cachedConfiguration;

  cachedConfiguration = await apiGet<CatalogConfigurationResponse>('/catalog/configuration');
  return cachedConfiguration;
};

export const fetchCampusCatalog = async () => {
  const data = await apiGet<UniversityResponse>('/catalog/universities');
  return data.results.map(({ country: _country, website: _website, ...rest }) => rest);
};

export const fetchIntentOptions = async () => {
  const configuration = await fetchConfiguration();
  return configuration.intents;
};

export const fetchWeightPresets = async () => {
  const configuration = await fetchConfiguration();
  return configuration.weightPresets;
};

export const fetchVerificationFlags = async () => {
  const configuration = await fetchConfiguration();
  return configuration.verificationFlags;
};
