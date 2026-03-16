import { useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthTokens } from "./auth-context";

/**
 * AuthProvider — wraps the app and provides auth state to all children via context.
 *
 * Tokens are persisted to localStorage so the user stays logged in after a page refresh.
 * The userId is decoded from the access token on every render using jwtDecode —
 * no extra API call needed since the user id is embedded in the JWT payload.
 */

const STORAGE_KEY = "arenax_auth_tokens";

// Decodes the JWT access token to extract the user's MongoDB _id
function getUserId(tokens: AuthTokens | null): string | null {
  if (!tokens?.accessToken) return null;
  try {
    const payload = jwtDecode<{ id: string }>(tokens.accessToken);
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newTokens: AuthTokens) => {
    setTokens(newTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
  };

  const logout = () => {
    setTokens(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      tokens,
      userId: getUserId(tokens),
      isAuthenticated: !!tokens?.accessToken,
      login,
      logout,
    }),
    [tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}