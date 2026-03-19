import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  type UserProfile,
} from "../services/userService";
import { getAllPosts, type Post } from "../services/postService";
import PostCard from "../components/PostCard";
import AppNavbar from "../components/AppNavbar";
import CommentsModal from "../components/CommentsModal";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import "./ProfilePage.css";

const API_URL = import.meta.env.VITE_API_URL as string;

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { tokens, userId } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwner = !!userId && userId === id;
  const { showToast } = useToast();

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "posts" | "commented" | "liked" | "wallet"
  >("posts");

  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // User's posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");

  // Comments modal state for profile posts
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Temporary wallet and profile stats data
  // These can be replaced later with real backend values
  const walletBalance = 120.5;
  const availableBalance = 95.0;
  const pendingBalance = 25.5;

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);

  // Temporary placeholder arrays for future backend integration
  const commentedPosts: Post[] = [];
  const likedPosts: Post[] = [];

  // Load profile + posts on mount
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getProfile(id)
      .then((data) => {
        setProfile(data);
        setBioInput(data.bio ?? "");
        setUsernameInput(data.username);
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load profile");
        } else {
          setError("Failed to load profile");
        }
      })
      .finally(() => setLoading(false));

    // Load this user's posts
    setPostsLoading(true);
    setPostsError("");

    getAllPosts({ userId: id, limit: 100 })
      .then((result) => setPosts(result.items))
      .catch(() => setPostsError("Failed to load posts"))
      .finally(() => setPostsLoading(false));
  }, [id]);

  const handleSaveBio = async () => {
    if (!tokens?.accessToken) return;

    setBioLoading(true);
    setBioError("");

    try {
      const updated = await updateProfile({ bio: bioInput }, tokens.accessToken);
      setProfile(updated);
      setEditingBio(false);
      showToast("Bio updated!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setBioError(err.response?.data?.message || "Failed to update bio");
      } else {
        setBioError("Failed to update bio");
      }
    } finally {
      setBioLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!tokens?.accessToken || !usernameInput.trim()) return;

    setUsernameLoading(true);
    setUsernameError("");

    try {
      const updated = await updateProfile(
        { username: usernameInput.trim() },
        tokens.accessToken
      );
      setProfile(updated);
      setUsernameInput(updated.username);
      setEditingUsername(false);
      showToast("Username updated!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUsernameError(
          err.response?.data?.message || "Failed to update username"
        );
      } else {
        setUsernameError("Failed to update username");
      }
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    setAvatarLoading(true);
    setAvatarError("");

    try {
      const { profilePicture } = await uploadAvatar(file, tokens.accessToken);
      setProfile((prev) => (prev ? { ...prev, profilePicture } : prev));
      showToast("Profile photo updated!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAvatarError(err.response?.data?.message || "Failed to upload avatar");
      } else {
        setAvatarError("Failed to upload avatar");
      }
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleCommentsCountUpdated = (
    postId: string,
    commentsCount: number
  ) => {
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

  const avatarSrc = profile?.profilePicture
    ? `${API_URL}${profile.profilePicture}`
    : null;

  if (loading) {
    return (
      <div className="profile-page">
        <AppNavbar />
        <div className="profile-loading">
          <div className="spinner" />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <AppNavbar />
        <div className="profile-container">
          <div className="alert-error">{error}</div>
          <br />
          <button className="btn" onClick={() => navigate("/feed")} type="button">
            ← Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page">
      <AppNavbar />

      <div className="profile-container">
        {/* Back */}
        <button className="btn" onClick={() => navigate("/feed")} type="button">
          ← Back to Feed
        </button>

        {/* Profile card */}
        <div className="profile-card card">
          {/* Hero */}
          <div className="profile-hero">
            <div className="profile-hero-inner">
              {/* Avatar */}
              <div className="avatar-wrap">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}

                {isOwner && (
                  <>
                    <button
                      className="avatar-edit-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      title="Change photo"
                      type="button"
                    >
                      {avatarLoading ? (
                        "…"
                      ) : (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              {/* Identity */}
              <div className="profile-identity">
                {/* Username — inline edit for owner */}
                {isOwner && editingUsername ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <input
                      className="input"
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        padding: "6px 10px",
                      }}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={30}
                      disabled={usernameLoading}
                    />
                    {usernameError && (
                      <div className="alert-error" style={{ fontSize: 12 }}>
                        {usernameError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "4px 12px" }}
                        onClick={handleSaveUsername}
                        disabled={usernameLoading || !usernameInput.trim()}
                        type="button"
                      >
                        {usernameLoading ? "Saving…" : "Save"}
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: "4px 12px" }}
                        onClick={() => {
                          setEditingUsername(false);
                          setUsernameInput(profile.username);
                          setUsernameError("");
                        }}
                        disabled={usernameLoading}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 className="profile-username">{profile.username}</h2>
                    {isOwner && (
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "2px 8px" }}
                        onClick={() => setEditingUsername(true)}
                        type="button"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}

                <span className="profile-email">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {profile.email}
                </span>
              </div>
            </div>

            {avatarError && (
              <div className="alert-error" style={{ marginTop: 16 }}>
                {avatarError}
              </div>
            )}
          </div>

          <div className="profile-hr" />

          {/* Bio */}
          <div className="profile-bio-section">
            <div className="bio-header">
              <span className="bio-label">About</span>
              {isOwner && !editingBio && (
                <button
                  className="btn btn-ghost"
                  onClick={() => setEditingBio(true)}
                  type="button"
                >
                  Edit bio
                </button>
              )}
            </div>

            {editingBio ? (
              <div>
                <textarea
                  className="bio-textarea"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  maxLength={300}
                  rows={4}
                  placeholder="Tell people a bit about yourself…"
                />
                <div className="bio-editor-footer">
                  <span className="bio-count">{bioInput.length} / 300</span>
                  <div className="bio-actions">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingBio(false);
                        setBioInput(profile.bio ?? "");
                        setBioError("");
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveBio}
                      disabled={bioLoading}
                      type="button"
                    >
                      {bioLoading ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
                {bioError && <div className="alert-error">{bioError}</div>}
              </div>
            ) : (
              <p className={`bio-text${profile.bio ? "" : " bio-empty"}`}>
                {profile.bio || "No bio yet."}
              </p>
            )}
          </div>
        </div>

        {/* Wallet + Stats section */}
        <div className="profile-dashboard">
          {/* Wallet card */}
          <div className="wallet-card card">
            <div className="wallet-header">
              <div>
                <p className="wallet-label">ArenaX Wallet</p>
                <h3 className="wallet-balance">${walletBalance.toFixed(2)}</h3>
              </div>

              <div className="wallet-badge">Active</div>
            </div>

            <div className="wallet-meta">
              <div className="wallet-meta-item">
                <span className="wallet-meta-label">Available</span>
                <strong className="wallet-meta-value">
                  ${availableBalance.toFixed(2)}
                </strong>
              </div>

              <div className="wallet-meta-item">
                <span className="wallet-meta-label">Pending</span>
                <strong className="wallet-meta-value">
                  ${pendingBalance.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="wallet-actions">
              <button type="button" className="btn btn-primary">
                Add Funds
              </button>
              <button type="button" className="btn">
                Withdraw
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="profile-stats card">
            <div className="profile-stat-item">
              <strong>{totalPosts}</strong>
              <span>Posts</span>
            </div>

            <div className="profile-stat-item">
              <strong>{totalLikes}</strong>
              <span>Total Likes</span>
            </div>

            <div className="profile-stat-item">
              <strong>{totalComments}</strong>
              <span>Total Comments</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab${activeTab === "posts" ? " active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            My Posts
          </button>

          <button
            type="button"
            className={`profile-tab${activeTab === "commented" ? " active" : ""}`}
            onClick={() => setActiveTab("commented")}
          >
            Commented
          </button>

          <button
            type="button"
            className={`profile-tab${activeTab === "liked" ? " active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>

          <button
            type="button"
            className={`profile-tab${activeTab === "wallet" ? " active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            Wallet
          </button>
        </div>

        {/* Tab content */}
        <div style={{ marginTop: 24 }}>
          {activeTab === "posts" && (
            <>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                My Posts
              </p>

              {postsLoading ? (
                <div
                  style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}
                >
                  <div className="spinner" />
                </div>
              ) : postsError ? (
                <div className="alert-error" style={{ textAlign: "center" }}>
                  {postsError}
                </div>
              ) : posts.length === 0 ? (
                <div className="profile-empty-state">
                  You have not published any posts yet.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    accessToken={tokens?.accessToken ?? null}
                    currentUserId={userId}
                    onDelete={(postId) =>
                      setPosts((prev) => prev.filter((p) => p._id !== postId))
                    }
                    onUpdate={(updated) =>
                      setPosts((prev) =>
                        prev.map((p) => (p._id === updated._id ? updated : p))
                      )
                    }
                    onOpenComments={handleOpenComments}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "commented" && (
            <>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                Commented Posts
              </p>

              {commentedPosts.length === 0 ? (
                <div className="profile-empty-state">
                  You have not commented on any posts yet.
                </div>
              ) : (
                commentedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    accessToken={tokens?.accessToken ?? null}
                    currentUserId={userId}
                    onDelete={() => {}}
                    onUpdate={() => {}}
                    onOpenComments={handleOpenComments}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "liked" && (
            <>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                Liked Posts
              </p>

              {likedPosts.length === 0 ? (
                <div className="profile-empty-state">
                  You have not liked any posts yet.
                </div>
              ) : (
                likedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    accessToken={tokens?.accessToken ?? null}
                    currentUserId={userId}
                    onDelete={() => {}}
                    onUpdate={() => {}}
                    onOpenComments={handleOpenComments}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "wallet" && (
            <div className="wallet-panel card">
              <div className="wallet-panel-header">
                <div>
                  <p className="wallet-label">ArenaX Wallet</p>
                  <h3 className="wallet-balance">${walletBalance.toFixed(2)}</h3>
                </div>
                <div className="wallet-badge">Active</div>
              </div>

              <div className="wallet-meta">
                <div className="wallet-meta-item">
                  <span className="wallet-meta-label">Available</span>
                  <strong className="wallet-meta-value">
                    ${availableBalance.toFixed(2)}
                  </strong>
                </div>

                <div className="wallet-meta-item">
                  <span className="wallet-meta-label">Pending</span>
                  <strong className="wallet-meta-value">
                    ${pendingBalance.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="wallet-actions">
                <button type="button" className="btn btn-primary">
                  Add Funds
                </button>
                <button type="button" className="btn">
                  Withdraw
                </button>
              </div>

              <div className="profile-empty-state" style={{ marginTop: 20 }}>
                Transaction history will appear here in a future phase.
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          accessToken={tokens?.accessToken ?? null}
          onClose={() => setSelectedPostId(null)}
          onCommentsCountUpdated={handleCommentsCountUpdated}
        />
      )}
    </div>
  );
}