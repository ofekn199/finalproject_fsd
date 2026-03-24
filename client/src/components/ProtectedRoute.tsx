import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/**
 * ProtectedRoute — wraps pages that require login.
 * If the user is not authenticated, redirects them to the login page (/).
 *
 * Usage in App.tsx:
 *   <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
 */

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  // Not logged in → send to login page, replace so back button doesn't return here
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}