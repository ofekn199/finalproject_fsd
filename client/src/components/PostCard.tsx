import { useState } from "react";
import axios from "axios";
import {
  type Post,
  updatePost,
  deletePost,
  toggleLike,
} from "../services/postService";
import {
  analyzePost,
  analyzeChess,
  type AIAnalysis,
  type ChessAnalysis,
} from "../services/aiService";
import ChessAnalysisBoard from "./ChessAnalysisBoard";
import { useToast } from "../context/ToastContext";
import "./PostCard.css";

interface PostCardProps {
  post: Post;
  accessToken: string | null;
  currentUserId: string | null;
  onDelete: (postId: string) => void;
  onUpdate: (updated: Post) => void;
  onOpenComments: (postId: string) => void;
}

export default function PostCard({
  post,
  accessToken,
  currentUserId,
  onDelete,
  onUpdate,
  onOpenComments,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editImage, setEditImage] = useState<File | null | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(post.isLikedByUser ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [liking, setLiking] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [chessResult, setChessResult] = useState<ChessAnalysis | null>(null);

  const { showToast } = useToast();

  const isOwner = currentUserId === post.author._id;
  const hasFen = !!post.fen?.trim();

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function formatBestMove(move?: string): string {
    if (!move || move.length < 4) return move || "Unknown";
    return `${move.slice(0, 2)} → ${move.slice(2, 4)}`;
  }

  const handleSave = async () => {
    if (!accessToken || !editText.trim()) return;

    setSaving(true);
    setError("");

    try {
      const updated = await updatePost(
        post._id,
        editText.trim(),
        accessToken,
        editImage,
        post.fen ?? ""
      );

      onUpdate(updated);
      setIsEditing(false);

      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

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
    }
  };

  const handleCancelEdit = () => {
    setEditText(post.text);

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditImage(undefined);
    setImagePreview("");
    setIsEditing(false);
    setError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditImage(null);
    setImagePreview("");
  };

  const handleLike = async () => {
    if (!accessToken || liking) return;

    setLiking(true);
    try {
      const result = await toggleLike(post._id, accessToken);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch {
      // Ignore like toggle errors silently
    } finally {
      setLiking(false);
    }
  };

  const handleAnalyze = async () => {
    if (aiLoading) return;

    setAiLoading(true);

    try {
      if (hasFen && post.fen) {
        const result = await analyzeChess(post.fen);
        setChessResult(result);
        setAiResult(null);
      } else {
        const result = await analyzePost(post.text, post.imageUrl);
        setAiResult(result);
        setChessResult(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showToast(
          err.response?.data?.message ||
            (hasFen
              ? "Failed to analyze chess position"
              : "Failed to analyze post"),
          "error"
        );
      } else {
        showToast(
          hasFen ? "Failed to analyze chess position" : "Failed to analyze post",
          "error"
        );
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyFen = async () => {
    if (!post.fen) return;

    try {
      await navigator.clipboard.writeText(post.fen);
      showToast("FEN copied!", "success");
    } catch {
      showToast("Failed to copy FEN", "error");
    }
  };

  const editImageSrc =
    imagePreview ||
    (editImage === null
      ? ""
      : post.imageUrl
        ? `${import.meta.env.VITE_API_URL}${post.imageUrl}`
        : "");

  const displayImageSrc = post.imageUrl
    ? `${import.meta.env.VITE_API_URL}${post.imageUrl}`
    : "";

  return (
    <div className="card post-card">
      <div className="post-card__header">
        <div className="post-card__avatar">
          {post.author.profilePicture ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${post.author.profilePicture}`}
              alt={post.author.username}
              className="post-card__avatar-img"
            />
          ) : (
            <span className="post-card__avatar-fallback">
              {post.author.username[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="post-card__author">
          <div className="post-card__username">{post.author.username}</div>
          <div className="post-card__time">{timeAgo(post.createdAt)}</div>
        </div>

        {hasFen && !isEditing && <div className="post-card__fen-badge">♟ Chess</div>}

        {isOwner && !isEditing && !confirmDelete && (
          <div className="post-card__actions">
            <button
              type="button"
              className="btn btn-ghost post-card__small-btn"
              onClick={() => {
                setIsEditing(true);
                setError("");
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger post-card__small-btn"
              onClick={() => {
                setConfirmDelete(true);
                setError("");
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="post-card__confirm">
          <span className="post-card__confirm-text">Delete this post?</span>
          <div className="post-card__confirm-actions">
            <button
              type="button"
              className="btn btn-danger post-card__small-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              className="btn btn-ghost post-card__small-btn"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert-error post-card__error">{error}</div>}

      {isEditing ? (
        <div className="post-card__editor">
          <textarea
            className="input post-card__textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
          />

          {editImageSrc && (
            <div className="post-card__image-wrapper post-card__image-wrapper--edit">
              <img
                src={editImageSrc}
                alt="Post preview"
                className="post-card__image"
              />
            </div>
          )}

          <div className="post-card__image-controls">
            {editImageSrc && (
              <button
                type="button"
                className="btn btn-danger post-card__small-btn"
                onClick={handleRemoveImage}
              >
                Remove image
              </button>
            )}

            <label className="post-card__image-label">
              {editImageSrc ? "Replace image" : "Add image"}
              <input
                type="file"
                accept="image/*"
                className="post-card__image-input"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="post-card__editor-actions">
            <button
              type="button"
              className="btn btn-primary post-card__editor-btn"
              onClick={handleSave}
              disabled={saving || !editText.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn post-card__editor-btn"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="post-card__text">{post.text}</p>
      )}

      {!isEditing && post.imageUrl && (
        <div className="post-card__image-wrapper">
          <img src={displayImageSrc} alt="Post" className="post-card__image" />
        </div>
      )}

      <div className="post-card__footer">
        <button
          type="button"
          onClick={handleLike}
          disabled={!accessToken || liking}
          className={`post-card__icon-btn ${
            liked ? "post-card__icon-btn--liked" : ""
          }`}
          title={liked ? "Unlike" : "Like"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likesCount}
        </button>

        <button
          type="button"
          onClick={() => onOpenComments(post._id)}
          className="post-card__icon-btn"
          title="Open comments"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.commentsCount}
        </button>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={aiLoading}
          className="post-card__icon-btn post-card__ai-btn"
          title={hasFen ? "Analyze chess position" : "Analyze with AI"}
        >
          <span>{hasFen ? "♟" : "🤖"}</span>
          {aiLoading ? "Analyzing..." : hasFen ? "Analyze Chess" : "Analyze"}
        </button>
      </div>

      {aiResult && (
        <div className="post-card__ai-result">
          <div className="post-card__ai-row">
            <strong>Summary:</strong> {aiResult.summary}
          </div>
          <div className="post-card__ai-row">
            <strong>Insight:</strong> {aiResult.insight}
          </div>
          <div className="post-card__ai-row">
            <strong>Suggestion:</strong> {aiResult.suggestion}
          </div>
        </div>
      )}

      {chessResult && (
        <div className="post-card__ai-result post-card__chess-result">
          <div className="post-card__chess-header">
            <strong>Chess AI Analysis</strong>
            {post.fen && (
              <button
                type="button"
                className="post-card__copy-btn"
                onClick={handleCopyFen}
              >
                Copy FEN
              </button>
            )}
          </div>

          <div className="post-card__ai-row">
            <strong>Best Move:</strong> {formatBestMove(chessResult.bestMove)}
          </div>
          <div className="post-card__ai-row">
            <strong>Evaluation:</strong> {chessResult.evaluation}
          </div>
          <div className="post-card__ai-row">
            <strong>Principal Line:</strong>{" "}
            {chessResult.line.length > 0
              ? chessResult.line.join(" → ")
              : "No line available"}
          </div>

          {post.fen && (
            <ChessAnalysisBoard
              fen={post.fen}
              bestMove={chessResult.bestMove}
            />
          )}
        </div>
      )}
    </div>
  );
}