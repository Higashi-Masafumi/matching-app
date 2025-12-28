import Constants from "expo-constants";
import type { PropsWithChildren } from "react";
import { Auth0Provider } from "react-native-auth0";

type ExpoExtra = {
  auth0Domain?: string;
  auth0ClientId?: string;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const extra = (Constants.expoConfig?.extra as ExpoExtra | undefined) ?? {};

  const domain =
    extra.auth0Domain ?? process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? "";
  const clientId =
    extra.auth0ClientId ?? process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? "";

  if (!domain || !clientId) {
    console.warn(
      "Auth0 configuration is missing. Please set auth0Domain and auth0ClientId in app.json extra or environment variables.",
    );
  }

  return (
    <Auth0Provider domain={domain} clientId={clientId}>
      {children}
    </Auth0Provider>
  );
}
