import { createContext } from "react";

/**
 * Auth context definition — defines the shape of data shared globally.
 *
 * tokens        — the raw JWT access + refresh tokens (or null if logged out)
 * userId        — the current user's MongoDB _id, decoded from the access token
 * isAuthenticated — true when an access token exists
 * login()       — stores new tokens in state + localStorage
 * logout()      — clears tokens from state + localStorage
 */

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthContextType = {
  tokens: AuthTokens | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);