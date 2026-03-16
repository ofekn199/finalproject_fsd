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