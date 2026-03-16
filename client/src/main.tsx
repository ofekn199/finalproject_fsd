import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Entry point of the React app.
 *
 * Provider order (outermost → innermost):
 *  1. GoogleOAuthProvider — makes the Google client ID available to the <GoogleLogin> button
 *  2. AuthProvider        — manages our own JWT tokens in state + localStorage
 *  3. App                 — the router and all pages
 */

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);