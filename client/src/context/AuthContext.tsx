import { useMemo, useState } from "react";
import { AuthContext, type AuthTokens } from "./auth-context";

const STORAGE_KEY = "arenax_auth_tokens";

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
      isAuthenticated: !!tokens?.accessToken,
      login,
      logout,
    }),
    [tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}