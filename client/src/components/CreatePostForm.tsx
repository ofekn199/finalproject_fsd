import { useRef, useState } from "react";
import axios from "axios";
import { createPost, type Post } from "../services/postService";
import { useToast } from "../context/ToastContext";

/*
 * CreatePostForm — form for writing and submitting a new post.
 *
 * - Textarea for post text (max 500 chars) with live character counter
 * - Optional image picker with preview thumbnail
 * - On submit: calls createPost → notifies parent via onCreated()
 * - On success: clears the form automatically
 */

interface CreatePostFormProps {
  accessToken: string;
  onCreated: (post: Post) => void; // parent prepends the new post to its list
}

export default function CreatePostForm({ accessToken, onCreated }: CreatePostFormProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When the user picks a file: store it and generate a local preview URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const post = await createPost(text.trim(), accessToken, image ?? undefined);
      onCreated(post);
      // Clear the form after successful submit
      if (preview) URL.revokeObjectURL(preview);
      setText("");
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Post created!", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create post");
      } else {
        setError("Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={formCardStyle}>
      <p style={titleStyle}>New Post</p>

      {/* Text input */}
      <textarea
        className="input"
        style={textareaStyle}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        disabled={loading}
      />
      <div style={charCountStyle}>{text.length} / 500</div>

      {/* Image preview */}
      {preview && (
        <div style={previewWrapStyle}>
          <img src={preview} alt="Preview" style={previewImgStyle} />
          <button
            className="btn btn-danger"
            style={removeImgBtnStyle}
            onClick={handleRemoveImage}
            disabled={loading}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert-error" style={{ marginBottom: 10 }}>{error}</div>}

      {/* Bottom row: attach image + submit */}
      <div style={bottomRowStyle}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 13 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {/* Paperclip icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          {image ? image.name : "Attach image"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        <button
          className="btn btn-primary"
          style={{ minWidth: 100, padding: "8px 20px" }}
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const formCardStyle: React.CSSProperties = {
  padding: "18px 20px",
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  color: "var(--muted)",
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const textareaStyle: React.CSSProperties = {
  minHeight: 90,
  resize: "vertical",
  marginBottom: 4,
};

const charCountStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  textAlign: "right",
  marginBottom: 10,
};

const previewWrapStyle: React.CSSProperties = {
  position: "relative",
  marginBottom: 12,
  display: "inline-block",
};

const previewImgStyle: React.CSSProperties = {
  maxHeight: 180,
  maxWidth: "100%",
  borderRadius: 10,
  display: "block",
};

const removeImgBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  padding: "2px 7px",
  fontSize: 12,
  borderRadius: 6,
};

const bottomRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};
