import { apiClient } from './api-client';

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

let cachedConfiguration: { intents: IntentOption[]; weightPresets: WeightPreset[]; verificationFlags: VerificationFlag[] } | null = null;

const unwrapResponse = <T,>(result: { data?: T; error?: { message?: string; data?: unknown } }) => {
  if (result.error || !result.data) {
    const message = (result.error as { data?: { message?: string }; message?: string })?.data?.message;
    throw new Error(message ?? result.error?.message ?? 'データの取得に失敗しました。');
  }

  return result.data;
};

const fetchConfiguration = async () => {
  if (cachedConfiguration) return cachedConfiguration;

  const response = await apiClient.GET('/catalog/configuration');
  const data = unwrapResponse(response);

  cachedConfiguration = data;
  return cachedConfiguration;
};

export const fetchCampusCatalog = async () => {
  const response = await apiClient.GET('/catalog/universities');
  const data = unwrapResponse(response);

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
