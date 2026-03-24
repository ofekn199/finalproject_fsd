import { useState } from "react";
import { register } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Register failed");
      } else {
        setErrorMessage("Register failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={wrapStyle}>

        {/* Brand */}
        <div style={brandStyle}>
          <div style={logoStyle}>A</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>ArenaX</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            Create your account
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
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                autoComplete="new-password"
              />
            </div>

            {errorMessage && (
              <div className="alert-error">{errorMessage}</div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "var(--cyan)", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
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
  padding: 28,
};

const fieldGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};
