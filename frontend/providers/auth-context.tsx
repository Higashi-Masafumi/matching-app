import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from 'react';

import {
  requestUniversityEmailOtp,
  verifyUniversityEmailOtp,
  type OtpRequestResponse,
} from '@/services/universityEmailOtp';

type AuthState = {
  accessToken: string | null;
  isLoading: boolean;
  userInfo: Record<string, unknown> | null;
};

type AuthAction =
  | { type: 'START_AUTH' }
  | { type: 'SET_TOKEN'; accessToken: string; userInfo: Record<string, unknown> | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  accessToken: null,
  isLoading: false,
  userInfo: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'START_AUTH':
      return { ...state, isLoading: true };
    case 'SET_TOKEN':
      return {
        ...state,
        accessToken: action.accessToken,
        userInfo: action.userInfo,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'LOGOUT':
      return { ...initialAuthState };
    default:
      return state;
  }
}

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: Record<string, unknown> | null;
  requestOtp: (email: string) => Promise<OtpRequestResponse>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const requestOtp = useCallback(async (email: string) => {
    dispatch({ type: 'START_AUTH' });

    try {
      const response = await requestUniversityEmailOtp({ email });
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return response;
    } catch (error) {
      console.error('Email OTP request failed', error);
      dispatch({ type: 'SET_LOADING', isLoading: false });
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    dispatch({ type: 'START_AUTH' });

    try {
      const result = await verifyUniversityEmailOtp({ email, code });
      dispatch({
        type: 'SET_TOKEN',
        accessToken: result.token,
        userInfo: {
          verifiedEmail: result.verifiedEmail,
          verifiedDomain: result.verifiedDomain,
          verifiedAt: result.verifiedAt,
        },
      });
    } catch (error) {
      console.error('Email OTP verification failed', error);
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const getAccessToken = useCallback(async () => state.accessToken, [state.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state.accessToken,
      isAuthenticated: !!state.accessToken,
      isLoading: state.isLoading,
      userInfo: state.userInfo,
      requestOtp,
      verifyOtp,
      logout,
      getAccessToken,
    }),
    [getAccessToken, logout, requestOtp, state.accessToken, state.isLoading, state.userInfo, verifyOtp]
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
