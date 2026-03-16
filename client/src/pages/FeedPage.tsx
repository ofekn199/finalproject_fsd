import { useAuth } from "../context/useAuth";

export default function FeedPage() {
  const { logout, tokens } = useAuth();

  return (
    <div>
      <h1>ArenaX Feed</h1>
      <p>You are logged in.</p>
      <p>Access token: {tokens?.accessToken ? "Stored" : "Missing"}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}