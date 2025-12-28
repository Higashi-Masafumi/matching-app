import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth0 } from "react-native-auth0";

type AuthContextValue = {
  accessToken: string | null;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const { user, authorize, isLoading } = useAuth0();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);
  const getAccessToken = useCallback(async () => {
    if (!user) return null;
    const credentials = await authorize({ scope: "openid profile email" });
    setAccessToken(credentials?.accessToken ?? null);
    return credentials?.accessToken ?? null;
  }, [user, authorize]);

  return (
    <AuthContext.Provider
      value={{ accessToken, isAuthenticated, isLoading, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
