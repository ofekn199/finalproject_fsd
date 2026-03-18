import { useContext } from "react";
import { AuthContext } from "./auth-context";

/**
 * useAuth — custom hook to access auth state anywhere in the app.
 *
 * Usage: const { tokens, userId, isAuthenticated, login, logout } = useAuth();
 *
 * Throws if used outside of <AuthProvider> to catch misconfiguration early.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}