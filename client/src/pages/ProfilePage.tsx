import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getProfile, updateBio, uploadAvatar, type UserProfile } from "../services/userService";
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

  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    getProfile(id)
      .then((data) => {
        setProfile(data);
        setBioInput(data.bio ?? "");
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load profile");
        } else {
          setError("Failed to load profile");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveBio = async () => {
    if (!tokens?.accessToken) return;
    setBioLoading(true);
    setBioError("");
    try {
      const updated = await updateBio(bioInput, tokens.accessToken);
      setProfile(updated);
      setEditingBio(false);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tokens?.accessToken) return;
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const { profilePicture } = await uploadAvatar(file, tokens.accessToken);
      setProfile((prev) => prev ? { ...prev, profilePicture } : prev);
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

        {/* Card */}
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
                <h2 className="profile-username">{profile.username}</h2>
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
                      onClick={() => {
                        setEditingBio(false);
                        setBioInput(profile.bio ?? "");
                        setBioError("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveBio}
                      disabled={bioLoading}
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
      </div>
    </div>
  );
}
