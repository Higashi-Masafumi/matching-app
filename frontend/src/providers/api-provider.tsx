import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import createFetchClient, { type Client, useAuth as createAuthMiddleware } from 'openapi-fetch';
import createReactQueryClient from 'openapi-react-query';

import type { paths } from '@/src/services/api-schema';
import { useAuth } from './auth-context';

const API_BASE_URL =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://localhost:3001';

type ApiClient = ReturnType<typeof createReactQueryClient<paths>>;
type ApiProviderValue = {
  openapi: ApiClient;
  fetchClient: Client<paths>;
};

const ApiClientContext = createContext<ApiProviderValue | null>(null);

export function ApiProvider({ children }: PropsWithChildren) {
  const { getAccessToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());

  const fetchClient = useMemo(() => {
    const client = createFetchClient<paths>({ baseUrl: API_BASE_URL });
    client.use(
      createAuthMiddleware({
        tokenPrefix: 'Bearer ',
        async getAccessToken() {
          const token = await getAccessToken();
          return token ?? null;
        },
      })
    );

    return client;
  }, [getAccessToken]);

  const apiClient = useMemo(() => createReactQueryClient(fetchClient), [fetchClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={{ openapi: apiClient, fetchClient }}>{children}</ApiClientContext.Provider>
    </QueryClientProvider>
  );
}

export function useApiClient() {
  const apiClient = useContext(ApiClientContext);

  if (!apiClient) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }

  return apiClient;
}
