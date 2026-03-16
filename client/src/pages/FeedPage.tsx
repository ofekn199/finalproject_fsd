import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { logoutRequest } from "../services/authService";
import axios from "axios";
import { useState } from "react";

export default function FeedPage() {
  const { logout, tokens } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    try {
      setErrorMessage("");

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
    }
  };

  return (
    <div>
      <h1>ArenaX Feed</h1>
      <p>You are logged in.</p>
      <p>Access token: {tokens?.accessToken ? "Stored" : "Missing"}</p>

      <button onClick={handleLogout}>Logout</button>

      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}