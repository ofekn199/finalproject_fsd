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

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      const res = await loginRequest({ username, password });

      login({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

      navigate("/feed");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || "Login failed");
      } else {
        setErrorMessage("Login failed");
      }
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    try {
      setErrorMessage("");

      const res = await googleLogin(credential);

      login({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

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
    <div>
      <h1>Login</h1>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <div style={{ marginTop: "16px" }}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              handleGoogleLogin(credentialResponse.credential);
            }
          }}
          onError={() => {
            setErrorMessage("Google login failed");
          }}
        />
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}