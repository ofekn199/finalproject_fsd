import { useEffect, useState } from "react";
import axios from "axios";
import { getComments, createComment } from "../services/commentService";
import { getPostById, type Post } from "../services/postService";

interface CommentItem {
  _id: string;
  text: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
    profilePicture?: string;
  };
}

interface CommentsModalProps {
  postId: string;
  accessToken: string | null;
  onClose: () => void;
  onCommentsCountUpdated: (postId: string, commentsCount: number) => void;
}

/**
 * CommentsModal
 *
 * Opens above the feed and displays:
 * - The selected post
 * - All comments related to the post
 * - Input for creating a new comment
 *
 * Behavior:
 * - Click outside closes the modal
 * - Escape key closes the modal
 * - Body scroll is disabled while modal is open
 */
export default function CommentsModal({
  postId,
  accessToken,
  onClose,
  onCommentsCountUpdated,
}: CommentsModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Disable body scroll while modal is open + support Escape key
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Load selected post
  useEffect(() => {
    setLoadingPost(true);
    setError("");

    getPostById(postId)
      .then((data) => {
        setPost(data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load post");
        } else {
          setError("Failed to load post");
        }
      })
      .finally(() => setLoadingPost(false));
  }, [postId]);

  // Load comments for selected post
  useEffect(() => {
    setLoadingComments(true);
    setError("");

    getComments(postId)
      .then((data) => {
        setComments(data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load comments");
        } else {
          setError("Failed to load comments");
        }
      })
      .finally(() => setLoadingComments(false));
  }, [postId]);

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const handleCreateComment = async () => {
    if (!accessToken || !text.trim()) return;

    setPosting(true);
    setError("");

    try {
      const newComment = await createComment(postId, text.trim(), accessToken);

      setComments((prev) => [newComment, ...prev]);
      setText("");

      if (post) {
        const nextCount = (post.commentsCount ?? 0) + 1;
        setPost({
          ...post,
          commentsCount: nextCount,
        });
        onCommentsCountUpdated(postId, nextCount);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create comment");
      } else {
        setError("Failed to create comment");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const authorImage =
    post?.author?.profileImage || post?.author?.profilePicture || "";

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle} onClick={handleContentClick}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Post comments</h2>
          <button style={closeButtonStyle} onClick={onClose} aria-label="Close comments">
            ×
          </button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        {/* Body */}
        <div style={bodyStyle}>
          {/* Post section */}
          <div style={postSectionStyle}>
            {loadingPost ? (
              <div style={loadingBoxStyle}>Loading post…</div>
            ) : post ? (
              <div className="card" style={postCardStyle}>
                {/* Author row */}
                <div style={postHeaderStyle}>
                  <div style={avatarStyle}>
                    {authorImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${authorImage}`}
                        alt={post.author.username}
                        style={avatarImgStyle}
                      />
                    ) : (
                      <span style={fallbackAvatarTextStyle}>
                        {post.author.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author.username}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {timeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

                <p style={postTextStyle}>{post.text}</p>

                {post.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                    alt="Post"
                    style={postImageStyle}
                  />
                )}

                <div style={metaRowStyle}>
                  <span>{post.likesCount} likes</span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>
            ) : (
              <div style={loadingBoxStyle}>Post not found</div>
            )}
          </div>

          {/* Comments section */}
          <div style={commentsSectionStyle}>
            <div style={commentsListStyle}>
              {loadingComments ? (
                <div style={loadingBoxStyle}>Loading comments…</div>
              ) : comments.length === 0 ? (
                <div style={emptyCommentsStyle}>No comments yet. Be the first to comment.</div>
              ) : (
                comments.map((comment) => {
                  const commentAuthorImage =
                    comment.author?.profileImage || comment.author?.profilePicture || "";

                  return (
                    <div key={comment._id} style={commentItemStyle}>
                      <div style={commentAvatarStyle}>
                        {commentAuthorImage ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${commentAuthorImage}`}
                            alt={comment.author.username}
                            style={avatarImgStyle}
                          />
                        ) : (
                          <span style={commentFallbackAvatarTextStyle}>
                            {comment.author.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div style={commentBubbleWrapStyle}>
                        <div style={commentBubbleStyle}>
                          <div style={commentAuthorStyle}>{comment.author.username}</div>
                          <div style={commentTextStyle}>{comment.text}</div>
                        </div>
                        <div style={commentMetaStyle}>{timeAgo(comment.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* New comment input */}
            <div style={composerStyle}>
              <textarea
                className="input"
                style={composerInputStyle}
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
              />
              <button
                className="btn btn-primary"
                style={composerButtonStyle}
                onClick={handleCreateComment}
                disabled={!text.trim() || posting || !accessToken}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.72)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 980,
  maxHeight: "90vh",
  borderRadius: 22,
  overflow: "hidden",
  background: "rgba(17, 22, 34, 0.94)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
};

const closeButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
};

const bodyStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  minHeight: 0,
  flex: 1,
};

const postSectionStyle: React.CSSProperties = {
  padding: 18,
  borderRight: "1px solid rgba(255,255,255,0.08)",
  overflowY: "auto",
};

const commentsSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const commentsListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 18,
};

const composerStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const composerInputStyle: React.CSSProperties = {
  minHeight: 74,
  resize: "vertical",
};

const composerButtonStyle: React.CSSProperties = {
  alignSelf: "flex-end",
  minWidth: 110,
};

const postCardStyle: React.CSSProperties = {
  padding: "18px 20px",
};

const postHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
};

const avatarStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "rgba(139,92,246,0.18)",
  border: "1px solid rgba(139,92,246,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
};

const commentAvatarStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "rgba(139,92,246,0.18)",
  border: "1px solid rgba(139,92,246,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
};

const avatarImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const fallbackAvatarTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--purple)",
};

const commentFallbackAvatarTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--purple)",
};

const postTextStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  marginBottom: 12,
};

const postImageStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  objectFit: "cover",
  maxHeight: 430,
  marginBottom: 12,
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 13,
  color: "var(--muted)",
  paddingTop: 10,
  borderTop: "1px solid rgba(255,255,255,0.07)",
};

const commentItemStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 14,
};

const commentBubbleWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const commentBubbleStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: "10px 12px",
  maxWidth: "100%",
};

const commentAuthorStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 4,
};

const commentTextStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const commentMetaStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  paddingLeft: 6,
};

const loadingBoxStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 14,
  padding: "16px 0",
};

const emptyCommentsStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 14,
  padding: "12px 0",
};