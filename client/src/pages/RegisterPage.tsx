import { useState } from "react";
import { register } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setErrorMessage("");

      await register({ username, email, password });
      navigate("/");
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    setErrorMessage(err.response?.data?.message || "Register failed");
  } else {
    setErrorMessage("Register failed");
  }
}
  };

  return (
    <div>
      <h1>Register</h1>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>

      {errorMessage && <p>{errorMessage}</p>}

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}