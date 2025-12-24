import Constants from 'expo-constants';
import createClient from 'openapi-fetch';
import type { paths } from '@/openapi/api-schema';

export const API_BASE_URL =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://localhost:3001';

export const createApiFetchClient = () => createClient<paths>({ baseUrl: API_BASE_URL });

export const apiClient = createApiFetchClient();
