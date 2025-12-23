import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  accessToken: string | null;
  idToken: string | null;
  isLoading: boolean;
  userInfo: Record<string, unknown> | null;
};

type AuthAction =
  | { type: 'START_AUTH' }
  | { type: 'SET_TOKENS'; accessToken: string; idToken: string | null }
  | { type: 'SET_USER'; userInfo: Record<string, unknown> | null }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  accessToken: null,
  idToken: null,
  isLoading: false,
  userInfo: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'START_AUTH':
      return { ...state, isLoading: true };
    case 'SET_TOKENS':
      return {
        ...state,
        accessToken: action.accessToken,
        idToken: action.idToken,
        isLoading: false,
      };
    case 'SET_USER':
      return { ...state, userInfo: action.userInfo, isLoading: false };
    case 'LOGOUT':
      return { ...initialAuthState };
    default:
      return state;
  }
}

type AuthContextValue = {
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: Record<string, unknown> | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getExpoExtra = () => (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export function AuthProvider({ children }: PropsWithChildren) {
  const extras = getExpoExtra();
  const domain = extras.auth0Domain ?? process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';
  const clientId = extras.auth0ClientId ?? process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';
  const audience = extras.auth0Audience ?? process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
    scheme: Constants.expoConfig?.scheme,
  });

  const discovery = AuthSession.useAutoDiscovery(`https://${domain}`);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: audience ? { audience } : undefined,
      usePKCE: true,
    },
    discovery
  );

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    if (!response || response.type !== 'success') return;
    if (!request || !discovery) return;

    const exchange = async () => {
      dispatch({ type: 'START_AUTH' });
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier ?? '',
            audience,
          },
        },
        discovery
      );

      dispatch({ type: 'SET_TOKENS', accessToken: tokenResult.accessToken ?? '', idToken: tokenResult.idToken ?? null });

      if (tokenResult.accessToken) {
        const profileResponse = await fetch(`https://${domain}/userinfo`, {
          headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
          },
        });

        if (profileResponse.ok) {
          const profileJson = await profileResponse.json();
          dispatch({ type: 'SET_USER', userInfo: profileJson });
        }
      }
    };

    exchange().catch((error) => {
      console.error('Auth0 login failed', error);
      dispatch({ type: 'LOGOUT' });
    });
  }, [response, request, discovery, clientId, redirectUri, audience, domain]);

  const login = useCallback(async () => {
    if (!clientId || !domain) {
      console.warn('Auth0 client ID or domain is not configured');
      return;
    }

    await promptAsync({ useProxy: true, showInRecents: true });
  }, [promptAsync, clientId, domain]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const getAccessToken = useCallback(async () => state.accessToken, [state.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state.accessToken,
      idToken: state.idToken,
      isAuthenticated: !!state.accessToken,
      isLoading: state.isLoading,
      userInfo: state.userInfo,
      login,
      logout,
      getAccessToken,
    }),
    [getAccessToken, login, logout, state.accessToken, state.idToken, state.isLoading, state.userInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
}
