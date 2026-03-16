import { useState } from "react";
import { googleLogin, login as loginRequest } from "../services/authService";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await loginRequest({ username, password });
      login({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      navigate("/feed");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Login failed");
      } else {
        setErrorMessage("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setErrorMessage("");
    try {
      const res = await googleLogin(credential);
      login({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      navigate("/feed");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Google login failed");
      } else {
        setErrorMessage("Google login failed");
      }
    }
  };

  return (
    <div style={pageStyle}>
      <div style={wrapStyle}>

        {/* Logo / brand */}
        <div style={brandStyle}>
          <div style={logoStyle}>A</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>ArenaX</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={cardStyle}>
          <div style={fieldGroupStyle}>
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="alert-error">{errorMessage}</div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--cyan)", fontWeight: 500 }}>
                Register
              </Link>
            </p>
          </div>

          <div className="hr" style={{ margin: "20px 0" }} />

          {/* Divider label */}
          <div style={orStyle}>
            <span style={{ background: "transparent", padding: "0 12px", color: "var(--muted)", fontSize: 12 }}>
              OR CONTINUE WITH
            </span>
          </div>

          {/* Google */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16, overflow: "hidden", borderRadius: 999 }}>
            <GoogleLogin
              onSuccess={(cr) => cr.credential && handleGoogleLogin(cr.credential)}
              onError={() => setErrorMessage("Google login failed")}
              theme="filled_black"
              shape="pill"
              width="320"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
};

const wrapStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 24,
};

const logoStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "linear-gradient(135deg, var(--purple), var(--cyan))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  fontWeight: 800,
  color: "#fff",
  marginBottom: 12,
  boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
};

const cardStyle: React.CSSProperties = {
  padding: "28px 28px 32px",
};

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const orStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  justifyContent: "center",
  color: "var(--muted)",
  fontSize: 12,
};
