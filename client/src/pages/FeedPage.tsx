import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { logoutRequest } from "../services/authService";
import { getPosts, type Post } from "../services/postService";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";

/*
 * FeedPage — main page of the app after login.
 *
 * Layout:
 *   - Sticky topbar with logo, My Profile, Sign out
 *   - CreatePostForm (only shown to logged-in users)
 *   - List of PostCards loaded from GET /posts
 *   - "Load more" button when there are more pages
 *
 * State:
 *   posts      — current list of posts (prepend on create, filter on delete)
 *   page       — current pagination page (starts at 1)
 *   hasMore    — whether there are more posts to load
 *   loading    — initial load spinner
 *   loadingMore — spinner for the "Load more" button
 */

export default function FeedPage() {
  const { logout, tokens, userId } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Load the first page of posts on mount
  useEffect(() => {
    setLoading(true);
    setFeedError("");
    getPosts(1)
      .then((result) => {
        setPosts(result.items);
        setPage(1);
        setHasMore(result.hasMore);
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setFeedError(err.response?.data?.message || "Failed to load posts");
        } else {
          setFeedError("Failed to load posts");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────

  // Append the next page of posts to the existing list
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await getPosts(nextPage);
      setPosts((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch {
      // silently fail — user can retry by clicking Load more again
    } finally {
      setLoadingMore(false);
    }
  };

  // Prepend the newly created post to the top of the feed
  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  // Remove a deleted post from the list
  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // Replace an updated post in the list
  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      if (tokens?.accessToken) await logoutRequest(tokens.accessToken);
    } catch {
      // proceed with local logout even if the server call fails
    } finally {
      logout();
      navigate("/");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>

      {/* ── Topbar ── */}
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

      {/* ── Main content ── */}
      <main style={mainStyle}>

        {logoutError && (
          <div className="alert-error" style={{ marginBottom: 16 }}>{logoutError}</div>
        )}

        {/* Create post form — only for logged-in users */}
        {tokens?.accessToken && (
          <CreatePostForm
            accessToken={tokens.accessToken}
            onCreated={handlePostCreated}
          />
        )}

        {/* Feed */}
        {loading ? (
          <div style={centerStyle}>
            <div className="spinner" />
          </div>
        ) : feedError ? (
          <div className="alert-error">{feedError}</div>
        ) : posts.length === 0 ? (
          <div style={emptyStyle}>
            <div style={emptyIconStyle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>
              No posts yet. Be the first to post!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                accessToken={tokens?.accessToken ?? null}
                currentUserId={userId}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <div style={centerStyle}>
                <button
                  className="btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ minWidth: 140 }}
                >
                  {loadingMore ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Loading…</> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  maxWidth: 680,
  width: "100%",
  margin: "0 auto",
  padding: "32px 18px 64px",
};

const centerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "32px 0",
};

const emptyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
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
