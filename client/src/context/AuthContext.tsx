import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthTokens } from "./auth-context";
import { api } from "../api/axios";

/**
 * AuthProvider — wraps the app and provides auth state to all children via context.
 *
 * Tokens are persisted to localStorage so the user stays logged in after a page refresh.
 * The userId is decoded from the access token on every render using jwtDecode —
 * no extra API call needed since the user id is embedded in the JWT payload.
 *
 * This provider also attaches a response interceptor to the shared `api` instance
 * that transparently refreshes expired access tokens and retries the original request.
 * See the useEffect below for details.
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

  // useCallback keeps login and logout referentially stable so the interceptor
  // useEffect below only runs once (its dep array only contains these two functions).
  const login = useCallback((newTokens: AuthTokens) => {
    setTokens(newTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Attach a response interceptor to the shared `api` axios instance.
   *
   * What it does:
   *  1. Passes all successful responses through unchanged.
   *  2. On a 401 error:
   *     - Skips auth endpoints (prevent infinite refresh loops).
   *     - Reads the current refresh token from localStorage (always up-to-date
   *       even after rotation, avoiding any stale-closure issue).
   *     - Calls POST /auth/refresh using raw axios (not `api`) so this interceptor
   *       does not intercept the refresh request itself.
   *     - On success: saves the new token pair via login() and retries the
   *       original request with the new access token.
   *     - On failure: calls logout() to clear the session.
   *
   * The interceptor is registered once on mount (login/logout are stable refs).
   * It is ejected on unmount to prevent duplicate handlers if AuthProvider
   * ever remounts.
   */
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        // Only handle 401s, only once per request, skip auth endpoints
        if (
          error.response?.status !== 401 ||
          original._retry ||
          original.url?.includes("/auth/")
        ) {
          return Promise.reject(error);
        }

        original._retry = true;

        try {
          // Read from localStorage so we always have the latest rotated token,
          // not a potentially stale value from the React state closure.
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) return Promise.reject(error);
          const { refreshToken } = JSON.parse(stored);
          if (!refreshToken) return Promise.reject(error);

          // Use raw axios so this request bypasses the interceptor entirely
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken }
          );

          const newTokens: AuthTokens = {
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };

          login(newTokens); // updates React state + localStorage atomically

          // Retry the original failed request with the fresh access token
          original.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
          return api(original);
        } catch {
          // Refresh failed (e.g. refresh token expired) — force the user to log in again
          logout();
          return Promise.reject(error);
        }
      }
    );

    // Clean up the interceptor when AuthProvider unmounts
    return () => api.interceptors.response.eject(interceptorId);
  }, [login, logout]); // stable refs — this effect runs exactly once

  const value = useMemo(
    () => ({
      tokens,
      userId: getUserId(tokens),
      isAuthenticated: !!tokens?.accessToken,
      login,
      logout,
    }),
    [tokens, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
