import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import type { Client, Middleware } from "openapi-fetch";
import createFetchClient from "openapi-fetch";
import createReactQueryClient from "openapi-react-query";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth0 } from "react-native-auth0";
import type { paths } from "@/openapi/api-schema";

const API_BASE_URL =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
    ?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

type ApiClient = ReturnType<typeof createReactQueryClient<paths>>;
type ApiProviderValue = {
  openapi: ApiClient;
  fetchClient: Client<paths>;
};

const ApiClientContext = createContext<ApiProviderValue | null>(null);

export function ApiProvider({ children }: PropsWithChildren) {
  const { authorize } = useAuth0();
  const [queryClient] = useState(() => new QueryClient());
  const auth0Audience =
    (Constants.expoConfig?.extra as { auth0Audience?: string } | undefined)
      ?.auth0Audience ?? process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;

  const fetchClient = useMemo(() => {
    const client = createFetchClient<paths>({ baseUrl: API_BASE_URL });
    const authorizeOptions = {
      scope: "openid profile email",
      ...(auth0Audience ? { audience: auth0Audience } : {}),
    };
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        const credentials = await authorize(authorizeOptions);
        const token = credentials?.accessToken;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      },
      async onResponse({ response }) {
        if (response.status === 401) {
          await authorize(authorizeOptions);
        }
        return response;
      },
    };
    client.use(authMiddleware);

    return client;
  }, [authorize, auth0Audience]);

  const apiClient = useMemo(
    () => createReactQueryClient(fetchClient),
    [fetchClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={{ openapi: apiClient, fetchClient }}>
        {children}
      </ApiClientContext.Provider>
    </QueryClientProvider>
  );
}

export function useApiClient() {
  const apiClient = useContext(ApiClientContext);

  if (!apiClient) {
    throw new Error("useApiClient must be used within an ApiProvider");
  }

  return apiClient;
}
