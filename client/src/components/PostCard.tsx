import { useState } from "react";
import axios from "axios";
import { type Post, updatePost, deletePost } from "../services/postService";
import { useToast } from "../context/ToastContext";

/*
 * PostCard — displays a single post in the feed.
 *
 * - Shows author avatar (initial fallback), username, relative time
 * - Shows post text and optional image
 * - Shows likes and comments counters
 * - If the logged-in user is the post owner: Edit and Delete buttons appear
 *
 * Edit mode: textarea + image controls appear inline.
 *   Save → calls updatePost → toast "Post updated!" → parent updates list
 *   Cancel → discards changes, returns to display mode
 *
 * Delete: clicking Delete shows an inline confirmation.
 *   Confirm → calls deletePost → parent removes the card
 *   Cancel → returns to normal view
 */

interface PostCardProps {
  post: Post;
  accessToken: string | null;
  currentUserId: string | null; // used to show/hide owner actions
  onDelete: (postId: string) => void;
  onUpdate: (updated: Post) => void;
}

export default function PostCard({
  post,
  accessToken,
  currentUserId,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  // undefined = no change, null = remove, File = replace
  const [editImage, setEditImage] = useState<File | null | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // The current user owns this post if their ID matches the author's ID
  const isOwner = currentUserId === post.author._id;

  // ── Helpers ──────────────────────────────────────────────────────────

  // Format ISO date as a short relative string e.g. "2h ago", "3d ago"
  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!accessToken || !editText.trim()) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updatePost(post._id, editText.trim(), accessToken, editImage);
      onUpdate(updated);
      setIsEditing(false);
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      showToast("Post updated!", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update post");
      } else {
        setError("Failed to update post");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleting(true);
    setError("");
    try {
      await deletePost(post._id, accessToken);
      onDelete(post._id);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to delete post");
      } else {
        setError("Failed to delete post");
      }
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(post.text);
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setEditImage(undefined);
    setImagePreview("");
    setIsEditing(false);
    setError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setEditImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setEditImage(null);
    setImagePreview("");
  };

  // ── Render ────────────────────────────────────────────────────────────

  // Resolve the image src to show in edit mode
  const editImageSrc = imagePreview || (editImage === null ? "" : post.imageUrl ? `${import.meta.env.VITE_API_URL}${post.imageUrl}` : "");

  return (
    <div className="card" style={cardStyle}>

      {/* Author row */}
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {post.author.profilePicture ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${post.author.profilePicture}`}
              alt={post.author.username}
              style={avatarImgStyle}
            />
          ) : (
            // Fallback: show the first letter of the username
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--purple)" }}>
              {post.author.username[0].toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author.username}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{timeAgo(post.createdAt)}</div>
        </div>

        {/* Owner actions — only visible to the post author */}
        {isOwner && !isEditing && !confirmDelete && (
          <div style={actionsStyle}>
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => { setIsEditing(true); setError(""); }}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => { setConfirmDelete(true); setError(""); }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Inline delete confirmation */}
      {confirmDelete && (
        <div style={confirmBoxStyle}>
          <span style={{ fontSize: 13 }}>Delete this post?</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-danger"
              style={{ padding: "4px 14px", fontSize: 12 }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 14px", fontSize: 12 }}
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert-error" style={{ margin: "8px 0" }}>{error}</div>
      )}

      {/* Post body — edit mode or display mode */}
      {isEditing ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            className="input"
            style={{ minHeight: 80, resize: "vertical" }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
          />

          {/* Image preview in edit mode */}
          {editImageSrc && (
            <img src={editImageSrc} alt="Post image" style={{ ...postImageStyle, marginTop: 8 }} />
          )}

          {/* Image controls: Remove (if image exists) + Add/Replace */}
          <div style={imageControlsStyle}>
            {editImageSrc && (
              <button
                className="btn btn-danger"
                style={{ padding: "5px 14px", fontSize: 12 }}
                onClick={handleRemoveImage}
                type="button"
              >
                Remove image
              </button>
            )}
            <label style={imageInputLabelStyle}>
              {editImageSrc ? "Replace image" : "Add image"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "8px 0" }}
              onClick={handleSave}
              disabled={saving || !editText.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className="btn"
              style={{ flex: 1, padding: "8px 0" }}
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>{post.text}</p>
      )}

      {/* Post image (display mode only) */}
      {!isEditing && post.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
          alt="Post image"
          style={postImageStyle}
        />
      )}

      {/* Footer: likes and comments counts */}
      <div style={footerStyle}>
        <span style={countStyle}>
          {/* Heart icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.likesCount}
        </span>
        <span style={countStyle}>
          {/* Comment icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {post.commentsCount}
        </span>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  padding: "18px 20px",
  marginBottom: 16,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
};

const avatarStyle: React.CSSProperties = {
  width: 38,
  height: 38,
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

const actionsStyle: React.CSSProperties = {
  marginLeft: "auto",
  display: "flex",
  gap: 6,
};

const confirmBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.25)",
  marginBottom: 12,
};

const postImageStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  marginBottom: 12,
  objectFit: "cover",
  maxHeight: 400,
};

const imageControlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
};

const imageInputLabelStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "5px 14px",
  fontSize: 12,
  borderRadius: 8,
  border: "1px dashed rgba(139,92,246,0.5)",
  color: "var(--purple)",
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  paddingTop: 10,
  borderTop: "1px solid rgba(255,255,255,0.07)",};

const countStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 13,
  color: "var(--muted)",
};
