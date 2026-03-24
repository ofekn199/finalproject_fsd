import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { getAllPosts, type Post } from "../services/postService";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";
import CommentsModal from "../components/CommentsModal";
import AppNavbar from "../components/AppNavbar";

/*
 * FeedPage — main page of the app after login.
 *
 * Layout:
 *   - Shared AppNavbar
 *   - CreatePostForm (only shown to logged-in users)
 *   - List of PostCards loaded from GET /posts
 *   - "Load more" button when there are more pages
 *   - Comments modal opened on top of the feed
 */

export default function FeedPage() {
  const { tokens, userId } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Load the first page of posts on mount
  useEffect(() => {
    setLoading(true);
    setFeedError("");

    getAllPosts({ page: 1 })
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

  // Append the next page of posts to the existing list
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const result = await getAllPosts({ page: nextPage });
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

  // Open comments modal for a selected post
  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
  };

  // Close comments modal
  const handleCloseComments = () => {
    setSelectedPostId(null);
  };

  // Update a post locally after a new comment is added inside the modal
  const handleCommentsCountUpdated = (postId: string, commentsCount: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              commentsCount,
            }
          : p
      )
    );
  };

  return (
    <div style={pageStyle}>
      <AppNavbar />

      <main style={mainStyle}>
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
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.5 }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
                onOpenComments={handleOpenComments}
              />
            ))}

            {hasMore && (
              <div style={centerStyle}>
                <button
                  type="button"
                  className="btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ minWidth: 140 }}
                >
                  {loadingMore ? (
                    <>
                      <div
                        className="spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />
                      {" "}Loading…
                    </>
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          accessToken={tokens?.accessToken ?? null}
          onClose={handleCloseComments}
          onCommentsCountUpdated={handleCommentsCountUpdated}
        />
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
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