import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { logoutRequest } from "../services/authService";

export default function AppNavbar() {
  const { logout, tokens, userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const isCommunityActive = location.pathname === "/feed";
  const isProfileActive = !!userId && location.pathname === `/profile/${userId}`;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (tokens?.accessToken) {
        await logoutRequest(tokens.accessToken);
      }
    } catch {
      // Continue with local logout even if server logout fails
    } finally {
      logout();
      navigate("/");
    }
  };

  return (
    <header style={topbarStyle}>
      <div style={topbarInnerStyle}>
        {/* Brand */}
        <button type="button" style={brandButtonStyle} onClick={() => navigate("/feed")}>
          <div style={logoStyle}>A</div>
          <span style={brandTextStyle}>ArenaX</span>
        </button>

        {/* Navigation */}
        <div style={navCenterStyle}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/feed")}
            style={isCommunityActive ? activeNavButtonStyle : undefined}
          >
            Community
          </button>

          {userId && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/profile/${userId}`)}
              style={isProfileActive ? activeNavButtonStyle : undefined}
            >
              My Profile
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const topbarStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(7,10,18,0.7)",
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 20,
};

const topbarInnerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "12px 20px",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: 16,
};

const brandButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  justifySelf: "start",
};

const logoStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  background: "linear-gradient(135deg, var(--purple), var(--cyan))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  fontWeight: 800,
  color: "#fff",
  boxShadow: "0 2px 10px rgba(139,92,246,0.4)",
};

const brandTextStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: "-0.02em",
  color: "#fff",
};

const navCenterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  justifySelf: "center",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  justifySelf: "end",
};

const activeNavButtonStyle: React.CSSProperties = {
  borderColor: "rgba(139,92,246,0.5)",
  color: "var(--purple)",
};