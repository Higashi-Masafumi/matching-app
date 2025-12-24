import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import * as AuthSession from 'expo-auth-session';
import Auth0 from 'expo-auth0';
import Constants from 'expo-constants';

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
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getExpoExtra = () => (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export function AuthProvider({ children }: PropsWithChildren) {
  const extras = getExpoExtra();
  const domain = extras.auth0Domain ?? process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';
  const clientId = extras.auth0ClientId ?? process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';
  const audience = extras.auth0Audience ?? process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;
  const normalizedDomain = useMemo(() => domain.replace(/^https?:\/\//, ''), [domain]);

  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        // Proxy is the recommended flow for managed Expo and development builds.
        useProxy: Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient',
        scheme: Constants.expoConfig?.scheme,
      }),
    []
  );

  const auth0Client = useMemo(() => new Auth0({ domain: normalizedDomain, clientId }), [clientId, normalizedDomain]);

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = useCallback(async () => {
    if (!clientId || !normalizedDomain) {
      console.warn('Auth0 client ID or domain is not configured');
      return;
    }

    dispatch({ type: 'START_AUTH' });

    try {
      const tokenResult = await auth0Client.webAuth.authorize({
        redirectUri,
        audience,
        scope: 'openid profile email',
        usePKCE: true,
      });

      dispatch({
        type: 'SET_TOKENS',
        accessToken: tokenResult.accessToken ?? '',
        idToken: tokenResult.idToken ?? null,
      });

      if (tokenResult.accessToken) {
        const profile = await auth0Client.auth.userInfo({ token: tokenResult.accessToken });
        dispatch({ type: 'SET_USER', userInfo: profile });
      }
    } catch (error) {
      console.error('Auth0 login failed', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [audience, auth0Client, clientId, normalizedDomain, redirectUri]);

  const logout = useCallback(async () => {
    try {
      await auth0Client.webAuth.clearSession({ federated: false, redirectUri });
    } catch (error) {
      console.warn('Auth0 logout failed', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, [auth0Client, redirectUri]);

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
