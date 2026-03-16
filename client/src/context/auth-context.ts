import { createContext } from "react";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthContextType = {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);