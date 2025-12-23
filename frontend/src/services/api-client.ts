import Constants from 'expo-constants';
import createClient from 'openapi-fetch';
import type { paths } from './api-schema';

const API_BASE_URL =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://localhost:3000';

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });
