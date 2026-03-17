import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getProfile, updateProfile, uploadAvatar, type UserProfile } from "../services/userService";
import { getAllPosts, type Post } from "../services/postService";
import PostCard from "../components/PostCard";
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
    getAllPosts({ userId: id, limit: 100 })
      .then((result) => setPosts(result.items))
      .catch(() => {/* silently fail */})
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
      const updated = await updateProfile({ username: usernameInput.trim() }, tokens.accessToken);
      setProfile(updated);
      setUsernameInput(updated.username);
      setEditingUsername(false);
      showToast("Username updated!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUsernameError(err.response?.data?.message || "Failed to update username");
      } else {
        setUsernameError("Failed to update username");
      }
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tokens?.accessToken) return;
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const { profilePicture } = await uploadAvatar(file, tokens.accessToken);
      setProfile((prev) => prev ? { ...prev, profilePicture } : prev);
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

  const avatarSrc = profile?.profilePicture
    ? `${API_URL}${profile.profilePicture}`
    : null;

  if (loading) {
    return (
      <div className="profile-page">
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
        <div className="profile-container">
          <div className="alert-error">{error}</div>
          <br />
          <button className="btn" onClick={() => navigate("/feed")}>← Back to Feed</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Back */}
        <button className="btn" onClick={() => navigate("/feed")}>
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
                    >
                      {avatarLoading ? "…" : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input
                      className="input"
                      style={{ fontSize: 18, fontWeight: 700, padding: "6px 10px" }}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={30}
                      disabled={usernameLoading}
                    />
                    {usernameError && <div className="alert-error" style={{ fontSize: 12 }}>{usernameError}</div>}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={handleSaveUsername} disabled={usernameLoading || !usernameInput.trim()}>
                        {usernameLoading ? "Saving…" : "Save"}
                      </button>
                      <button className="btn" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => { setEditingUsername(false); setUsernameInput(profile.username); setUsernameError(""); }} disabled={usernameLoading}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 className="profile-username">{profile.username}</h2>
                    {isOwner && (
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => setEditingUsername(true)}>
                        Edit
                      </button>
                    )}
                  </div>
                )}
                <span className="profile-email">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {profile.email}
                </span>
              </div>
            </div>

            {avatarError && (
              <div className="alert-error" style={{ marginTop: 16 }}>{avatarError}</div>
            )}
          </div>

          <div className="profile-hr" />

          {/* Bio */}
          <div className="profile-bio-section">
            <div className="bio-header">
              <span className="bio-label">About</span>
              {isOwner && !editingBio && (
                <button className="btn btn-ghost" onClick={() => setEditingBio(true)}>
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
                      onClick={() => { setEditingBio(false); setBioInput(profile.bio ?? ""); setBioError(""); }}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveBio} disabled={bioLoading}>
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

        {/* Posts section */}
        <div style={{ marginTop: 32 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Posts
          </p>

          {postsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
              <div className="spinner" />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: 14 }}>
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                accessToken={tokens?.accessToken ?? null}
                currentUserId={userId}
                onDelete={(postId) => setPosts((prev) => prev.filter((p) => p._id !== postId))}
                onUpdate={(updated) => setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
