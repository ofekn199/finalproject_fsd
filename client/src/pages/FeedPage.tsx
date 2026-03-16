import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { logoutRequest } from "../services/authService";
import axios from "axios";
import { useState } from "react";

export default function FeedPage() {
  const { logout, tokens, userId } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setErrorMessage("");
    try {
      if (tokens?.accessToken) {
        await logoutRequest(tokens.accessToken);
      }
      logout();
      navigate("/");
    } catch (err: unknown) {
      logout();
      navigate("/");
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Logout failed");
      } else {
        setErrorMessage("Logout failed");
      }
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div style={pageStyle}>

      {/* Topbar */}
      <header style={topbarStyle}>
        <div style={topbarInnerStyle}>
          <div style={brandStyle}>
            <div style={logoStyle}>A</div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>ArenaX</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {userId && (
              <button
                className="btn btn-ghost"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                My Profile
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={mainStyle}>
        {errorMessage && (
          <div className="alert-error" style={{ marginBottom: 20 }}>{errorMessage}</div>
        )}

        {/* Hero */}
        <div className="card" style={heroCardStyle}>
          <div style={heroGlowStyle} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 10 }}>
              Welcome to{" "}
              <span style={{ background: "linear-gradient(90deg, var(--purple), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ArenaX
              </span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>
              Your feed is coming soon. Posts, updates, and activity from your network will appear here.
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>No posts yet. Check back soon.</p>
        </div>
      </main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const topbarStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(7,10,18,0.7)",
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const topbarInnerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "12px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
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

const mainStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: 720,
  width: "100%",
  margin: "0 auto",
  padding: "32px 18px 64px",
};

const heroCardStyle: React.CSSProperties = {
  padding: 32,
  marginBottom: 20,
  position: "relative",
  overflow: "hidden",
};

const heroGlowStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(600px 200px at 10% 50%, rgba(139,92,246,0.25), transparent 55%), radial-gradient(500px 200px at 80% 0%, rgba(34,211,238,0.15), transparent 55%)",
  pointerEvents: "none",
};

const emptyStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 0",
};

const emptyIconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 20,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
