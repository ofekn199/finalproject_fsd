import axios from "axios";

/**
 * Shared Axios instance for all API calls.
 * baseURL comes from VITE_API_URL in the .env file (e.g. http://localhost:3000).
 * withCredentials allows cookies to be sent cross-origin if needed in the future.
 *
 * Import `api` in services instead of using axios directly,
 * so all requests automatically go to the correct server.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Automatically attach the stored access token to every request.
// Registered at module level (not in a React effect) so it is ready before
// any component fires its first data-fetch on mount.
const STORAGE_KEY = "arenax_auth_tokens";
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const { accessToken } = JSON.parse(stored);
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    } catch {
      // malformed entry — skip
    }
  }
  return config;
});